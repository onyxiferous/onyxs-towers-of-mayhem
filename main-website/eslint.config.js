import js from "@eslint/js";

export default [
    {
        ignores: [
            "node_modules/",
            "dist/",
            "build/",
        ],
    },

    js.configs.recommended,

    {
        files: ["**/*.js"],

        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                window: "readonly",
                document: "readonly",
                console: "readonly",
                fetch: "readonly",
                localStorage: "readonly",
                sessionStorage: "readonly",
            },
        },

        rules: {
            semi: ["error", "always"],
            "no-console": "off",
            "no-debugger": "warn",
            "no-unreachable": "error",
            "no-constant-condition": "error",
            "no-unused-vars": ["warn", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            }],
            "no-use-before-define": "error",
            eqeqeq: ["error", "always"],
            curly: ["error", "multi-line"],
            "no-var": "error",
            "prefer-const": "error",
            "object-shorthand": "error",
            "prefer-template": "error",
            "prefer-arrow-callback": "error",
            "no-duplicate-imports": "error",
            "no-duplicate-case": "error",
            "no-self-assign": "error",
            "no-self-compare": "error",
            "indent": ["warn", "tab"]
        },
    },
];