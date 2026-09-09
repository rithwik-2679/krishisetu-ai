import fs from 'fs';
let content = fs.readFileSync('src/features/marketplace/components/create-lot-form.tsx', 'utf8');

const newGradeUi = `<div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase flex justify-between">
                      Farmer-Declared Grade
                      <span className="text-gray-400 font-normal">Self-Assessment</span>
                    </label>
                    <div className="flex gap-2 items-start">
                      <select value={grade} onChange={e => setGrade(e.target.value as QualityAssessment['grade'])} className="px-3 py-2 border rounded-md text-sm flex-1">
                        <option value="A">Grade A (Premium)</option>
                        <option value="B">Grade B (Standard)</option>
                        <option value="C">Grade C (Processing)</option>
                        <option value="Unsorted">Unsorted / Bulk</option>
                      </select>
                      <div className={"text-[10px] px-2 py-1.5 rounded w-32 text-center font-bold flex flex-col justify-center " + (
                        grade === 'A' ? 'bg-green-50 text-green-700 border border-green-100' :
                        grade === 'B' ? 'bg-gray-50 text-gray-600 border border-gray-200' :
                        'bg-amber-50 text-amber-700 border border-amber-100'
                      )}>
                        {grade === 'A' ? '+5-10% Premium' : grade === 'B' ? 'Standard Rate' : '-10-15% Discount'}
                      </div>
                    </div>
                  </div>`;

content = content.replace(/<div className="flex flex-col gap-1\.5">\s*<label className="text-xs font-semibold text-gray-600 uppercase flex justify-between">\s*Grade Declaration\s*<span className="text-gray-400 font-normal">A, B, C or Unsorted<\/span>\s*<\/label>\s*<select value=\{grade\} onChange=\{e => setGrade\(e\.target\.value as QualityAssessment\['grade'\]\)\} className="px-3 py-2 border rounded-md text-sm">\s*<option value="A">Grade A \(Premium\)<\/option>\s*<option value="B">Grade B \(Standard\)<\/option>\s*<option value="C">Grade C \(Processing\)<\/option>\s*<option value="Unsorted">Unsorted \/ Bulk<\/option>\s*<\/select>\s*<\/div>/, newGradeUi);

fs.writeFileSync('src/features/marketplace/components/create-lot-form.tsx', content, 'utf8');
console.log("Updated Grade UI");
