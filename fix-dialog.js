const fs = require('fs');
const content = fs.readFileSync('src/components/data-migration/data-import-dialog.tsx', 'utf8');

// Fix all issues
let fixed = content
  .replace(/useState<boolean>\({false})/g, "useState<boolean>(false)")
  .replace(/useState<string>\({''})/g, "useState<string>('')")
  .replace(/useState<\{([^}]+)\} \| null>\(\{null\})/g, "useState<$1 | null>(null)")
  .replace(/React\.ChangeEvent<\{HTMLInputElement\}>/g, "React.ChangeEvent<HTMLInputElement>")
  .replace(/forEach<\(\{project: any, index: number\}\)> => \{/g, "forEach((project: any, index: number) => {")
  .replace(/forEach<\(\{shot: any, index: number\}\)> => \{/g, "forEach((shot: any, index: number) => {")
  .replace(/validateImportData<\(\{JSON\.parse\(jsonText\)\}\})/g, "validateImportData(JSON.parse(jsonText))")
  .replace(/成功导入 \$\{importedProjects\}/g, "成功导入 $\{importedProjects\}")
  .replace(/variant="outline"/g, 'variant="outline"');

fs.writeFileSync('src/components/data-migration/data-import-dialog.tsx', fixed, 'utf8');
console.log("Fixed data-import-dialog.tsx");
