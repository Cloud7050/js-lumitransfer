module.exports = {
	"extends": [
		"eslint:recommended"
	],
	"env": {
		"browser": true,
		"node": true,
		//NOTE Set to es2022 once VSCode eslint extension updates
		// https://github.com/eslint/eslint/pull/15587
		"es2021": true
	},
	"parserOptions": {
		"sourceType": "module",
		"ecmaFeatures": {
			"impliedStrict": true
		}
	},
	"rules": {
		// [Possible Problems]
		"array-callback-return": [
			1,
			{
				// "allowImplicit": false,
				"checkForEach": true // Was false
			}
		],
		// "constructor-super": 2,
		"for-direction": 1, // Was 2
		"getter-return": 1, // Was 2
		"no-async-promise-executor": 1, // Was 2
		"no-await-in-loop": 1,
		"no-class-assign": 1, // Was 2
		"no-compare-neg-zero": 1, // Was 2
		"no-cond-assign": [
			1, // Was 2
			"always" // Was "except-parens"
		],
		// "no-const-assign": 2,
		"no-constant-condition": [
			1, // Was 2
			{
				"checkLoops": false // Was true
			}
		],
		"no-constructor-return": 1,
		"no-control-regex": 1, // Was 2
		"no-debugger": 1, // Was 2
		// "no-dupe-args": 2,
		"no-dupe-class-members": 1, // Was 2
		"no-dupe-else-if": 1, // Was 2
		"no-dupe-keys": 1, // Was 2
		"no-duplicate-case": 1, // Was 2
		"no-duplicate-imports": 1,
		"no-empty-character-class": 1, // Was 2
		"no-empty-pattern": 1, // Was 2
		"no-ex-assign": 1, // Was 2
		"no-fallthrough": 1, // Was 2
		"no-func-assign": 1, // Was 2
		// "no-import-assign": 2,
		"no-inner-declarations": 0, // Was 2
		// "no-invalid-regexp": 2,
		"no-irregular-whitespace": [
			1, // Was 2
			{
				// "skipStrings": true,
				// "skipComments": false,
				// "skipRegExps": false,
				"skipTemplates": true // Was false
			}
		],
		"no-loss-of-precision": 1, // Was 2
		"no-misleading-character-class": 1, // Was 2
		// "no-new-symbol": 2,
		// "no-obj-calls": 2,
		"no-promise-executor-return": 1,
		// "no-prototype-builtins": 2,
		"no-self-assign": 1, // Was 2
		"no-self-compare": 1,
		"no-setter-return": 1, // Was 2
		"no-sparse-arrays": 1, // Was 2
		"no-template-curly-in-string": 1,
		// "no-this-before-super": 2,
		"no-undef": [
			2,
			{
				"typeof": true // Was false
			},
		],
		"no-unexpected-multiline": 1, // Was 2
		"no-unmodified-loop-condition": 1,
		"no-unreachable": 1, // Was 2
		"no-unreachable-loop": 1,
		"no-unsafe-finally": 1, // Was 2
		"no-unsafe-negation": [
			1, // Was 2
			{
				"enforceForOrderingRelations": true // Was false
			}
		],
		"no-unsafe-optional-chaining": [
			2,
			{
				"disallowArithmeticOperators": true // Was false
			}
		],
		"no-unused-private-class-members": 1,
		"no-unused-vars": [
			1, // Was 2
			{
				// "vars": "all",
				// "args": "after-used",
				// "ignoreRestSiblings": false,
				"argsIgnorePattern": "^_",
				"caughtErrors": "all", // Was "none"
				"caughtErrorsIgnorePattern": "^_"
			},
		],
		"no-use-before-define": [
			1,
			{
				"functions": false, // Was true
				// "classes": true,
				// "variables": true
			},
		],
		"no-useless-backreference": 1,
		"require-atomic-updates": 1,
		"use-isnan": [
			1, // Was 2
			{
				// "enforceForSwitchCase": true,
				"enforceForIndexOf": true // Was false
			}
		],
		"valid-typeof": [
			1, // Was 2
			{
				"requireStringLiterals": true // Was false
			}
		],

		// [Suggestions]
		"accessor-pairs": 1,
		"arrow-body-style": 1,
		"block-scoped-var": 1,
		"camelcase": 1,
		// "capitalized-comments": 0, // Allow commented code
		"class-methods-use-this": 1,
		"complexity": 1,
		"consistent-return": 1,
		"consistent-this": 1,
		"curly": [
			1,
			"multi-or-nest",
		],
		// "default-case": 0,
		"default-case-last": 1,
		"default-param-last": 1,
		"dot-notation": 1,
		"eqeqeq": 1,
		"func-name-matching": [
			1,
			"always", // Same
			{
				"considerPropertyDescriptor": true // Was false
				// "includeCommonJSModuleExports": false
			}
		],
		// "func-names": 0,
		"func-style": [
			1,
			"declaration"
		],
		"grouped-accessor-pairs": [
			1,
			"getBeforeSet"
		],
		"guard-for-in": 1,
		// "id-denylist": 0,
		// "id-length": 0,
		// "id-match": 0,
		// "init-declarations": 0,
		// "max-classes-per-file": 0,
		// "max-depth": 0,
		// "max-lines": 0,
		// "max-lines-per-function": 0,
		// "max-nested-callbacks": 0,
		// "max-params": 0,
		// "max-statements": 0,
		// "multiline-comment-style": 0,
		"new-cap": 1,

		//TODO
		"no-alert": 1,
		"no-caller": 1,
		// "no-case-declarations": 2,
		// "no-div-regex": 0,
		// "no-else-return": 0,
		"no-empty-function": 1,
		"no-eq-null": 1,
		// "no-eval": 0,
		"no-extend-native": 1,
		"no-extra-bind": 1,
		"no-extra-label": 1,
		"no-floating-decimal": 1,
		"no-global-assign": 1, // Was 2
		"no-implicit-coercion": 1,
		"no-implicit-globals": [
			1,
			{ "lexicalBindings": true },
		],
		"no-implied-eval": 1,
		"no-invalid-this": 1,
		"no-iterator": 1,
		// "no-labels": 0,
		"no-lone-blocks": 1,
		"no-loop-func": 1,
		// "no-magic-numbers": 0,
		"no-multi-spaces": 1,
		"no-multi-str": 1,
		"no-new": 1,
		"no-new-func": 1,
		"no-new-wrappers": 1,
		"no-octal": 1, // Was 2
		"no-octal-escape": 1,
		// "no-param-reassign": 0,
		"no-proto": 1,
		"no-redeclare": 1, // Was 2
		// "no-restricted-properties": 0,
		"no-return-assign": 1,
		"no-return-await": 1,
		"no-script-url": 1,
		"no-sequences": 1,
		"no-throw-literal": 1,
		"no-unused-expressions": 1,
		"no-unused-labels": 1, // Was 2
		"no-useless-call": 1,
		"no-useless-catch": 1, // Was 2
		"no-useless-concat": 1,
		"no-useless-escape": 1, // Was 2
		"no-useless-return": 1,
		"no-void": 1,
		// "no-warning-comments": 0,
		"no-with": 1, // Was 2
		"prefer-named-capture-group": 1,
		"prefer-promise-reject-errors": 1,
		"prefer-regex-literals": 1,
		// "radix": 0,
		"require-await": 1,
		"require-unicode-regexp": 1,
		// "vars-on-top": 0,
		"wrap-iife": [
			1,
			"inside",
			{ "functionPrototypeMethods": true },
		],
		"yoda": 1,

		// [Strict]
		// "strict": 0, // Forced off by parserOptions "sourceType": "module" OR ecmaFeatures "impliedStrict": true

		// [Variables]
		"no-delete-var": 1, // Was 2
		"no-label-var": 1,
		// "no-restricted-globals": 0,
		"no-shadow": [
			1,
			{
				"builtinGlobals": true,
				"hoist": "all",
				// "allow": [],
			},
		],
		"no-shadow-restricted-names": 1, // Was 2
		"no-undef-init": 1,
		// "no-undefined": 0,

		// [Stylistic Issues]
		"array-bracket-newline": [
			1,
			"consistent",
		],
		"array-bracket-spacing": 1,
		"array-element-newline": [
			1,
			"consistent",
		],
		"block-spacing": 1,
		"brace-style": 1,
		"comma-dangle": [
			1,
			{
				"arrays": "always-multiline",
				"objects": "always-multiline",
				// "imports": "never",
				// "exports": "never",
				// "functions": "never",
			},
		],
		"comma-spacing": 1,
		"comma-style": 1,
		"computed-property-spacing": 1,
		"eol-last": [
			1,
			"always",
		],
		"func-call-spacing": 1,
		"function-call-argument-newline": [
			1,
			"consistent",
		],
		"function-paren-newline": [
			1,
			"consistent",
		],
		"implicit-arrow-linebreak": 1,
		"indent": [
			1,
			"tab",
			{
				"SwitchCase": 1,
				// "VariableDeclarator": 1,
				// "outerIIFEBody": 1,
				// "MemberExpression": 1,
				// "FunctionDeclaration": {
				// 	"parameters": 1,
				// 	"body": 1,
				// },
				// "FunctionExpression": {
				// 	"parameters": 1,
				// 	"body": 1,
				// },
				// "CallExpression": {
				// 	"arguments ": 1,
				// },
				// "ArrayExpression": 1,
				// "ObjectExpression": 1,
				// "ImportDeclaration": 1,
				// "flatTernaryExpressions": false,
				// "offsetTernaryExpressions": false,
				// "ignoredNodes": [],
				// "ignoreComments": false,
			},
		],
		"jsx-quotes": 1,
		"key-spacing": 1,
		"keyword-spacing": 1,
		// "line-comment-position": 0,
		"linebreak-style": [
			1,
			"windows",
		],
		// "lines-around-comment": 0,
		// "lines-between-class-members": 0,
		// "max-len": 0,
		"max-statements-per-line": 1,
		"multiline-ternary": [
			1,
			"always-multiline",
		],
		"new-parens": 1,
		"newline-per-chained-call": 1,
		"no-array-constructor": 1,
		"no-bitwise": 1,
		// "no-continue": 0,
		// "no-inline-comments": 0,
		"no-lonely-if": 1,
		"no-mixed-operators": 1,
		"no-mixed-spaces-and-tabs": [ // Was 2
			1,
			"smart-tabs",
		],
		"no-multi-assign": 1,
		"no-multiple-empty-lines": [
			1,
			{
				"max": 3,
				// "maxEOF": null,
				// "maxBOF": null,
			},
		],
		// "no-negated-condition": 0,
		// "no-nested-ternary": 0,
		"no-new-object": 1,
		// "no-plusplus": 0,
		// "no-restricted-syntax": 0,
		// "no-tabs": 0,
		// "no-ternary": 0,
		"no-trailing-spaces": 1,
		"no-underscore-dangle": 1,
		"no-unneeded-ternary": [
			1,
			{ "defaultAssignment": false }, // Want to use ?? or || instead
		],
		"no-whitespace-before-property": 1,
		"nonblock-statement-body-position": 1,
		"object-curly-newline": [
			1,
			{
				"ObjectExpression": {
					"multiline": true,
					"minProperties": 2,
					"consistent": true,
				},
				"ObjectPattern": {
					"multiline": true,
					// "minProperties": null,
					"consistent": true,
				},
				"ImportDeclaration": {
					"multiline": true,
					// "minProperties": null,
					"consistent": true,
				},
				"ExportDeclaration": {
					"multiline": true,
					// "minProperties": null,
					"consistent": true,
				},
			},
		],
		"object-curly-spacing": [
			1,
			"always",
		],
		"object-property-newline": 1,
		"one-var": [
			1,
			"never",
		],
		"one-var-declaration-per-line": 1,
		"operator-assignment": 1,
		"operator-linebreak": [
			1,
			"before",
		],
		"padded-blocks": [
			1,
			"never",
		],
		// "padding-line-between-statements": 0,
		"prefer-exponentiation-operator": 1,
		"prefer-object-spread": 1,
		"quote-props": 1,
		"quotes": [
			1,
			"double",
		],
		"semi": 1,
		"semi-spacing": 1,
		"semi-style": 1,
		// "sort-keys": 0,
		// "sort-vars": 0,
		"space-before-blocks": 1,
		"space-before-function-paren": [
			1,
			{
				"anonymous": "never",
				"named": "never",
				"asyncArrow": "always",
			},
		],
		"space-in-parens": [
			1,
			"never",
		],
		"space-infix-ops": 1,
		"space-unary-ops": 1,
		// "spaced-comment": 0,
		"switch-colon-spacing": 1,
		"template-tag-spacing": 1,
		"unicode-bom": 1,
		// "wrap-regex": 0,

		// [ECMAScript 6]
		"arrow-parens": 1,
		"arrow-spacing": 1,
		"generator-star-spacing": [
			1,
			"after",
		],
		"no-confusing-arrow": 1,

		// "no-restricted-exports": 0,
		// "no-restricted-imports": 0,
		"no-useless-computed-key": [
			1,
			{ "enforceForClassMembers": true },
		],
		"no-useless-constructor": 1,
		"no-useless-rename": 1,
		"no-var": 1,
		"object-shorthand": 1,
		"prefer-arrow-callback": 1,
		// "prefer-const": 0, // If using, should {"ignoreReadBeforeAssign": true}
		// "prefer-destructuring": 0,
		"prefer-numeric-literals": 1,
		"prefer-rest-params": 1,
		"prefer-spread": 1,
		"prefer-template": 1,
		"require-yield": 1, // Was 2
		"rest-spread-spacing": 1,
		// "sort-imports": 0,
		"symbol-description": 1,
		"template-curly-spacing": 1,
		"yield-star-spacing": 1,

		// [Temp - Remaining Possible Errors]
		// "no-console": 0,
		"no-empty": 1, // Was 2
		"no-extra-boolean-cast": [ // Was 2
			1,
			{ "enforceForLogicalOperands": true },
		],
		"no-extra-parens": [
			1,
			"all",
			{
				// "returnAssign": true,
				"nestedBinaryExpressions": false, // Allows a || (b && c)
				// "ignoreJSX": "none",
				"enforceForArrowConditionals": false, // Allows c => (1 ? 2 : 3)
				// "enforceForSequenceExpressions": true,
				"enforceForNewInMemberExpressions": false, // Allows (new Bar()).baz
			},
		],
		"no-extra-semi": 1, // Was 2
		"no-regex-spaces": 1, // Was 2

		// [Temp - Remaining Best Practices]
		"dot-location": [
			1,
			"property",
		],
	},
};