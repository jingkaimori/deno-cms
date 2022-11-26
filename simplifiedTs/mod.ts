import { path, fs, ts } from "./deps.ts";

const LibPrefix = "node_modules/@typescript"
const defaultLib = "lib.default.d.ts"
console.log(LibPrefix)

//console.log(Array.from(fs.walkSync("./simplifiedTs/lib")))

//console.log(Deno.readTextFileSync("./simplifiedTs/lib/lib.d.ts"))

function createCompilerHost(
    options: ts.CompilerOptions,
    moduleSearchLocations: string[],
): ts.CompilerHost {
    const fileExists = (filename: string) => (console.log(filename),true);
    const readFile = (filename: string) => (console.log(filename),undefined);
    return {
        getSourceFile,
        getDefaultLibFileName: () => path.join(LibPrefix,defaultLib),
        getDefaultLibLocation: () => LibPrefix,
        writeFile: () => undefined,
        getCurrentDirectory: () => "./",
        getDirectories: (dest) => [path.join("./",dest)],
        getCanonicalFileName: (fileName) => fileName,
        getNewLine: () => "\n",
        useCaseSensitiveFileNames: () => true,
        fileExists,
        readFile,
        resolveModuleNames,
        
    };

    function resolveModuleNames(
        moduleNames: string[],
        containingFile: string,
    ): ts.ResolvedModule[] {
        console.log(arguments)
        const resolvedModules: ts.ResolvedModule[] = [];
        for (const moduleName of moduleNames) {
            // try to use standard resolution
            const result = ts.resolveModuleName(
                moduleName,
                containingFile,
                options,
                {
                    fileExists,
                    readFile,
                },
            );
            if (result.resolvedModule) {
                resolvedModules.push(result.resolvedModule);
            } else {
                // check fallback locations, for simplicity assume that module at location
                // should be represented by '.d.ts' file
                for (const location of moduleSearchLocations) {
                    const modulePath = path.join(
                        location,
                        moduleName + ".d.ts",
                    );
                    if (fileExists(modulePath)) {
                        resolvedModules.push({ resolvedFileName: modulePath });
                    }
                }
            }
        }
        return resolvedModules;
    }

    function getSourceFile(
        fileName: string,
        languageVersionOrOptions: ts.ScriptTarget | ts.CreateSourceFileOptions,
        onError?: (message: string) => void,
        shouldCreateNewSourceFile?: boolean,
    ): ts.SourceFile | undefined {
        // console.log(arguments)
        const result = path.parse(fileName);
        console.log(result)
        let filecontent = ""
        if (result.dir == LibPrefix) {
            let realname = "";
            if (result.base == defaultLib) {
                realname = path.join("./simplifiedTs","lib/","lib.d.ts")
            } else {
                const basename = result.name.replace(/lib-(.+)/,"lib.$1.d.ts")
                realname = path.join("./simplifiedTs","lib/",basename)
            }
            console.log(realname)
            filecontent = Deno.readTextFileSync(realname)
        }else {
            filecontent = `
                use strict;
                const variant = [1,2];
                variant.map((num)=>num*4)
            `
        }
        return ts.createSourceFile(
            fileName,
            filecontent,
            languageVersionOrOptions,
            false,
            ts.ScriptKind.TS,
        );
    }
}

const prog = ts.createProgram({
    rootNames: [
        "processer",
    ],
    host:createCompilerHost({},[]),
    options:{
        alwaysStrict:true,
        // module:ts.ModuleKind.ES2022,
        // moduleResolution:ts.ModuleResolutionKind.Classic,
        // target:ts.ScriptTarget.ES2022,
    }

});

console.log(prog.getGlobalDiagnostics())
console.log(prog.getSourceFile("processer.ts")?.getFullText())

