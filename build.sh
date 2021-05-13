#!/usr/bin/env bash

(echo 'const SiteswapJS = (function () {' ; cat LICENSE src/*.js ; echo 'return SiteswapJS; })();') > ss.js
