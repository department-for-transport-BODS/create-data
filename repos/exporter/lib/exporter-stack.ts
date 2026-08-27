import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Fn, Duration } from 'aws-cdk-lib';
import {
    aws_s3 as s3,
    aws_lambda as coreLambda,
    aws_lambda_nodejs as lambda,
    aws_iam as iam,
    aws_ec2 as ec2,
    aws_sns as sns,
    aws_cloudwatch_actions as cloudwatchActions,
    aws_cloudwatch as cloudwatch,
    aws_events as events,
    aws_events_targets as eventsTargets,
} from 'aws-cdk-lib';

export class ExporterStack extends Stack {
    private readonly stage: string;
    private readonly matchingDataBucket: s3.IBucket;
    private readonly productsBucket: s3.IBucket;
    private readonly exportMetadataBucket: s3.IBucket;

    constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);

        const stage = process.env.STAGE;
        if (!stage) {
            throw new Error('Need to set STAGE');
        }
        this.stage = stage;

        const vpc = ec2.Vpc.fromLookup(this, 'vpc', { vpcName: `fdbt-vpc-${this.stage}` });
        const vpcSubnets = {
            subnets: [
                ec2.Subnet.fromSubnetId(this, 'vpc-subnet-a', Fn.importValue(`${this.stage}:PrivateSubnetA`)),
                ec2.Subnet.fromSubnetId(this, 'vpc-subnet-b', Fn.importValue(`${this.stage}:PrivateSubnetB`)),
            ],
        };
        const securityGroup = ec2.SecurityGroup.fromSecurityGroupId(
            this,
            'security-group',
            Fn.importValue(`${this.stage}:ReferenceDataUploaderLambdaSG`),
        );

        this.productsBucket = new s3.Bucket(this, `products-data-bucket-${this.stage}`, {
            bucketName: `fdbt-products-data-${this.stage}`,
            encryption: s3.BucketEncryption.KMS_MANAGED,
        });

        this.matchingDataBucket = s3.Bucket.fromBucketName(
            this,
            `fdbt-matching-data-${this.stage}`,
            `fdbt-matching-data-${this.stage}`,
        );

        this.exportMetadataBucket = s3.Bucket.fromBucketName(
            this,
            `fdbt-export-metadata-${this.stage}`,
            `fdbt-export-metadata-${this.stage}`,
        );

        this.addNeedsAttentionLambda(securityGroup, vpc, vpcSubnets);
        this.addReferenceDataLambdas(securityGroup, vpc, vpcSubnets);
        this.addBastionTerminatorLambda();
        this.addExporterLambdas(securityGroup, vpc, vpcSubnets);
    }

    private addNeedsAttentionLambda(
        securityGroup: ec2.ISecurityGroup,
        vpc: ec2.IVpc,
        vpcSubnets: { subnets: ec2.ISubnet[] },
    ) {
        const atcoCodeCheckerFunction = new lambda.NodejsFunction(this, `atco-code-checker-${this.stage}`, {
            functionName: `atco-code-checker-${this.stage}`,
            runtime: coreLambda.Runtime.NODEJS_24_X,
            entry: './lib/atcoCheckerHandler.ts',
            environment: {
                PRODUCTS_BUCKET: this.productsBucket.bucketName,
                MATCHING_DATA_BUCKET: this.matchingDataBucket.bucketName,
                RDS_HOST: Fn.importValue(`${this.stage}:RdsClusterInternalEndpoint`),
                STAGE: this.stage,
            },
            securityGroups: [securityGroup],
            vpc: vpc,
            vpcSubnets: vpcSubnets,
            bundling: {
                sourceMap: true,
                sourceMapMode: lambda.SourceMapMode.DEFAULT,
            },
            timeout: Duration.minutes(15),
            logRetention: 180,
        });

        this.addAlarmsToLambda(atcoCodeCheckerFunction, `atcoCodeCheckerFunction-${this.stage}`, 420000);

        atcoCodeCheckerFunction.addToRolePolicy(
            new iam.PolicyStatement({ actions: ['ssm:GetParameter', 's3:GetObject'], resources: ['*'] }),
        );

        new events.Rule(this, `atco-code-checker-rule-${this.stage}`, {
            schedule: events.Schedule.cron({ minute: '0', hour: '6' }), // every day at 6am
            targets: [new eventsTargets.LambdaFunction(atcoCodeCheckerFunction)],
        });
    }

    private addExporterLambdas(
        securityGroup: ec2.ISecurityGroup,
        vpc: ec2.IVpc,
        vpcSubnets: { subnets: ec2.ISubnet[] },
    ) {
        const exporterFunction = new lambda.NodejsFunction(this, `exporter-${this.stage}`, {
            functionName: `exporter-${this.stage}`,
            runtime: coreLambda.Runtime.NODEJS_24_X,
            entry: './lib/handler.ts',
            environment: {
                PRODUCTS_BUCKET: this.productsBucket.bucketName,
                MATCHING_DATA_BUCKET: this.matchingDataBucket.bucketName,
                EXPORT_METADATA_BUCKET: this.exportMetadataBucket.bucketName,
                RDS_HOST: Fn.importValue(`${this.stage}:RdsClusterInternalEndpoint`),
                STAGE: this.stage,
            },
            securityGroups: [securityGroup],
            vpc: vpc,
            vpcSubnets: vpcSubnets,
            bundling: {
                sourceMap: true,
                sourceMapMode: lambda.SourceMapMode.DEFAULT,
            },
            timeout: Duration.minutes(15),
            logRetention: 180,
            memorySize: 2048,
            reservedConcurrentExecutions: 5,
        });

        this.addAlarmsToLambda(exporterFunction, `exporter-${this.stage}`, 300000);

        exporterFunction.addToRolePolicy(new iam.PolicyStatement({ actions: ['ssm:GetParameter'], resources: ['*'] }));

        this.productsBucket.grantRead(exporterFunction);
        this.matchingDataBucket.grantWrite(exporterFunction);
        this.exportMetadataBucket.grantWrite(exporterFunction);

        const netexBucket = s3.Bucket.fromBucketName(this, 'netex-bucket', `fdbt-netex-data-${this.stage}`);
        const zipperFunction = new lambda.NodejsFunction(this, `zipper-${this.stage}`, {
            functionName: `zipper-${this.stage}`,
            runtime: coreLambda.Runtime.NODEJS_24_X,
            entry: './lib/zipperHandler.ts',
            environment: {
                NETEX_BUCKET: netexBucket.bucketName,
                MATCHING_DATA_BUCKET: this.matchingDataBucket.bucketName,
                STAGE: this.stage,
            },
            bundling: {
                sourceMap: true,
                sourceMapMode: lambda.SourceMapMode.DEFAULT,
            },
            timeout: Duration.minutes(15),
            logRetention: 180,
            memorySize: 2048,
        });

        netexBucket.grantReadWrite(zipperFunction);

        this.addAlarmsToLambda(zipperFunction, `zipper-${this.stage}`, 60000);
    }

    private addBastionTerminatorLambda() {
        const bastionTerminatorFunction = new lambda.NodejsFunction(this, `bastion-terminator-${this.stage}`, {
            functionName: `bastion-terminator-${this.stage}`,
            runtime: coreLambda.Runtime.NODEJS_24_X,
            entry: './lib/bastionTerminator.ts',
            bundling: {
                sourceMap: true,
                sourceMapMode: lambda.SourceMapMode.DEFAULT,
            },
            timeout: Duration.minutes(1),
            logRetention: 180,
        });

        this.addAlarmsToLambda(bastionTerminatorFunction, `bastion-terminator-${this.stage}`, 30000);

        bastionTerminatorFunction.addToRolePolicy(
            new iam.PolicyStatement({ actions: ['ec2:TerminateInstances', 'ec2:DescribeInstances'], resources: ['*'] }),
        );

        new events.Rule(this, `bastion-terminator-rule-${this.stage}`, {
            schedule: events.Schedule.cron({ weekDay: 'MON', minute: '0', hour: '6' }), // every monday at 6am
            targets: [new eventsTargets.LambdaFunction(bastionTerminatorFunction)],
        });
    }

    private addReferenceDataLambdas(
        securityGroup: ec2.ISecurityGroup,
        vpc: ec2.IVpc,
        vpcSubnets: { subnets: ec2.ISubnet[] },
    ) {
        const tableRenameFunction = new lambda.NodejsFunction(this, `table-rename-${this.stage}`, {
            functionName: `table-rename-${this.stage}`,
            runtime: coreLambda.Runtime.NODEJS_24_X,
            entry: './lib/referenceData/tableRenameHandler.ts',
            environment: {
                RDS_HOST: Fn.importValue(`${this.stage}:RdsClusterInternalEndpoint`),
                STAGE: this.stage,
            },
            securityGroups: [securityGroup],
            vpc: vpc,
            vpcSubnets: vpcSubnets,
            bundling: {
                sourceMap: true,
                sourceMapMode: lambda.SourceMapMode.DEFAULT,
            },
            timeout: Duration.minutes(15),
            logRetention: 180,
        });

        this.addAlarmsToLambda(tableRenameFunction, `tableRenameFunction-${this.stage}`, 420000);

        tableRenameFunction.addToRolePolicy(
            new iam.PolicyStatement({ actions: ['ssm:GetParameter', 'ssm:PutParameter'], resources: ['*'] }),
        );

        new events.Rule(this, `table-rename-rule-${this.stage}`, {
            schedule: events.Schedule.cron({ minute: '30', hour: '5' }), // every day at 5:30am
            targets: [new eventsTargets.LambdaFunction(tableRenameFunction)],
        });
    }

    private addAlarmsToLambda(lambdaFn: lambda.NodejsFunction, id: string, durationThreshold: number) {
        const alarmTopicArn = Fn.importValue(`${this.stage}:SlackAlertsTopicArn`);
        const alarmTopic = sns.Topic.fromTopicArn(this, `${id}-alarm-topic-${this.stage}`, alarmTopicArn);
        const snsAction = new cloudwatchActions.SnsAction(alarmTopic);

        const errorsAlarm = lambdaFn
            .metricErrors({ period: Duration.minutes(1) })
            .createAlarm(this, `${id}-errors-alarm`, {
                threshold: 1,
                evaluationPeriods: 1,
                treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
            });
        const durationAlarm = lambdaFn
            .metricDuration({ period: Duration.minutes(1), statistic: 'max' })
            .createAlarm(this, `${id}-duration-alarm`, {
                threshold: durationThreshold,
                evaluationPeriods: 1,
                treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
            });

        durationAlarm.addAlarmAction(snsAction);
        durationAlarm.addInsufficientDataAction(snsAction);
        durationAlarm.addOkAction(snsAction);

        errorsAlarm.addAlarmAction(snsAction);
        errorsAlarm.addInsufficientDataAction(snsAction);
        errorsAlarm.addOkAction(snsAction);
    }
}
