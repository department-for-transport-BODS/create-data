help: ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

run: ## Run everything locally
	cd fdbt-dev && $(MAKE) dev

up: ## Run just the docker containers so the site can be run separately to debug
	cd fdbt-dev && $(MAKE) docker-up

down: ## Bring down docker containers
	cd fdbt-dev && $(MAKE) docker-down

mise-install:
	mise install

install: ## Install all node modules
	cd ${FDBT_ROOT}/repos/fdbt-netex-output && npm i
	cd ${FDBT_ROOT}/repos/fdbt-netex-output/src/netex-validator && npm i
	cd ${FDBT_ROOT}/repos/fdbt-site && npm i
	cd ${FDBT_ROOT}/repos/fdbt-reference-data-service/src/retrievers && npm i
	cd ${FDBT_ROOT}/repos/fdbt-reference-data-service/src/uploaders && npm i
	cd ${FDBT_ROOT}/repos/exporter && npm i
	cd ${FDBT_ROOT}/repos/fdbt-emailer && npm i
	pip3 install \
    -r ${FDBT_ROOT}/repos/fdbt-reference-data-service/src/retrievers/requirements.txt \
    -r ${FDBT_ROOT}/repos/fdbt-reference-data-service/src/uploaders/requirements.txt \
    -r ${FDBT_ROOT}/repos/fdbt-netex-output/src/netex-validator/requirements.txt

audit-fix: ## Fix all npm audit issues
	cd ${FDBT_ROOT}/repos/fdbt-netex-output && npm audit fix
	cd ${FDBT_ROOT}/repos/fdbt-netex-output/src/netex-validator && npm audit fix
	cd ${FDBT_ROOT}/repos/fdbt-site && npm audit fix
	cd ${FDBT_ROOT}/repos/fdbt-reference-data-service/src/retrievers && npm audit fix
	cd ${FDBT_ROOT}/repos/fdbt-reference-data-service/src/uploaders && npm audit fix
	cd ${FDBT_ROOT}/repos/exporter && npm audit fix
	cd ${FDBT_ROOT}/repos/fdbt-emailer && npm audit fix

cypress: ## Open cypress console to run UI tests
	cd repos/fdbt-site && $(MAKE) open-cypress
