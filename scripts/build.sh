#!/bin/sh

FAKE=0
if [ "$1" == "--fake" ]; then
	echo "If this build fails, it will not return an error."
	FAKE=1
fi

# if the tests fail (and we're not trying to work with bloody Windows), abort (errexit)
set -e

export MOD='node_modules/.bin'

echo "> linting..."
set +e
eslint src
eslint test/browser-tests
eslint test/node-tests
set -e

# build library plus tests
echo "> emptying tmp dir..."
rm -rf tmp/*

echo "> building Ractive..."
export COMMIT_HASH=`git rev-parse HEAD`

export VERSION=$(cat package.json | grep "version" | sed 's/"version": "\(.*\)",/\1/' | sed 's/[[:space:]]//g')

# temporarily allow command failure
set +e
$MOD/gobble build tmp
OK=$?
if [ $FAKE -eq 0 -a $OK -ne 0 ]; then
	exit 1
elif [ $OK -ne 0 ]; then
	# we're faking, so roll on
	exit 0
fi
set -e

# run the tests
echo "> running tests..."
./scripts/test.sh

# if the tests passed, copy to the build folder...
echo "> tests passed. minifying..."

compress () {
	local src=$1
	local dest=${src%.js}.min.js
	local MOD="../node_modules/.bin"

	$MOD/uglifyjs \
		--compress \
		--mangle \
		--source-map $dest.map \
		--output $dest \
		--preamble "/* Ractive.js v${VERSION}-${COMMIT_HASH} - License MIT */" \
		-- $src \
		> /dev/null 2>&1

	echo "  minified $src"
	echo "  fixing $dest sourcemap ($PWD)"

	$MOD/sorcery -i $dest
	echo "  fixed $dest sourcemap"

}

( cd tmp
	for i in *.js; do compress "$i" & done
	wait
)
echo "> emptying build folder..."
rm -rf build

# make sure there is a build folder
if [ ! -d build ]; then
	mkdir build
fi

echo "> copying library to build folder..."
mkdir -p build/typings
cp tmp/*.js build
cp tmp/*.map build
cp typings/* build/typings

echo "> copying *.json files to build folder..."
for FILE in scripts/templates/*.json; do
	cat $FILE | sed "s/VERSION_PLACEHOLDER/$VERSION/" > build/${FILE#scripts/templates/}
done

echo "> copying README.md to build folder..."
cp README.md build

echo "> build complete"

if [ $FAKE -eq 1 ]; then
	exit 0
fi
