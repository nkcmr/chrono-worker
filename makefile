ESBUILD = node_modules/.bin/esbuild

build/worker.js: node_modules/.ok $(shell find ./src -type f)
	$(ESBUILD) ./src/main.ts --outfile=$@ --bundle

node_modules/.ok: package.json package-lock.json
	npm i
	touch $@
