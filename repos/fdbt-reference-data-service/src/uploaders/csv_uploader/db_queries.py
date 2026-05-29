def public_name_query(bucket_name):
    return [
        "SET FOREIGN_KEY_CHECKS = 0;",
        "DROP TABLE IF EXISTS nocPublicNameNew;",
        "CREATE TABLE nocPublicNameNew LIKE nocPublicName;",
        f"LOAD DATA FROM S3 's3-eu-west-2://{bucket_name}/PublicName.csv' REPLACE INTO TABLE nocPublicNameNew FIELDS TERMINATED BY ',' ENCLOSED BY '\"' ESCAPED BY '' LINES TERMINATED BY '\\n' IGNORE 1 lines ( pubNmId, operatorPublicName, pubNmQual, ttrteEnq, fareEnq, lostPropEnq, disruptEnq, complEnq, twitter, facebook, linkedin, youtube, changeDate, changeAgent, changeComment, ceasedDate, dataOwner, website );",
        "SET FOREIGN_KEY_CHECKS = 1;",
    ]


def noc_table_query(bucket_name):
    return [
        "SET FOREIGN_KEY_CHECKS = 0;",
        "DROP TABLE IF EXISTS nocTableNew;",
        "CREATE TABLE nocTableNew LIKE nocTable;",
        f"LOAD DATA FROM S3 's3-eu-west-2://{bucket_name}/NOCTable.csv' REPLACE INTO TABLE nocTableNew FIELDS TERMINATED BY ',' ENCLOSED BY '\"' ESCAPED BY '' LINES TERMINATED BY '\\n' IGNORE 1 lines ( nocCode, operatorPublicName, vosaPsvLicenseName, opId, pubNmId, nocCdQual, changeDate, changeAgent, changeComment, dateCeased, dataOwner );",
        "SET FOREIGN_KEY_CHECKS = 1;",
    ]


def noc_lines_query(bucket_name):
    return [
        "SET FOREIGN_KEY_CHECKS = 0;",
        "DROP TABLE IF EXISTS nocLineNew;",
        "CREATE TABLE nocLineNew LIKE nocLine;",
        f"LOAD DATA FROM S3 's3-eu-west-2://{bucket_name}/NOCLines.csv' REPLACE INTO TABLE nocLineNew FIELDS TERMINATED BY ',' ENCLOSED BY '\"' ESCAPED BY '' LINES TERMINATED BY '\\n' IGNORE 1 lines ( nocLineNo, nocCode, pubNm, refNm, licence, mode, tlRegOwn, ebsrAgent, lo, sw, wm, wa, yo, nw, ne, sc, se, ea, em, ni, nx, megabus, newBharat, terravision, ncsd, easybus, yorksRt, travelEnq, comment, auditDate, auditEditor, auditComment, duplicate, dateCeased, cessationComment );",
        "SET FOREIGN_KEY_CHECKS = 1;",
    ]


def stops_query(bucket_name):
    return [
        "SET FOREIGN_KEY_CHECKS = 0;",
        "DROP TABLE IF EXISTS naptanStopNew;",
        "CREATE TABLE naptanStopNew LIKE naptanStop;",
        f"LOAD DATA FROM S3 's3-eu-west-2://{bucket_name}/Stops.csv' REPLACE INTO TABLE naptanStopNew CHARACTER SET UTF8 FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '\"' LINES TERMINATED BY '\\n' IGNORE 1 lines ( atcoCode, naptanCode, plateCode, cleardownCode, commonName, commonNameLang, shortCommonName, shortCommonNameLang, landmark, landmarkLang, street, streetLang, crossing, crossingLang, indicator, indicatorLang, bearing, nptgLocalityCode, localityName, parentLocalityName, grandParentLocalityName, town, townLang, suburb, suburbLang, localityCentre, gridType, easting, northing, longitude, latitude, stopType, busStopType, timingStatus, defaultWaitTime, notes, notesLang, administrativeAreaCode, creationDateTime, modificationDateTime, revisionNumber, modification, status );",
        "SET FOREIGN_KEY_CHECKS = 1;",
    ]
