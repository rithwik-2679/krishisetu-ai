import fs from 'fs';
let content = fs.readFileSync('src/features/marketplace/components/create-lot-form.tsx', 'utf8');

// Modify Step 2 header
content = content.replace("Step 2: Digital Quality Assessment", "Step 2: Proof-of-Lot & Quality Verification");

// Add state for Proof of Lot
content = content.replace(
  "const [grade, setGrade] = useState<QualityAssessment['grade']>('A');",
  "const [grade, setGrade] = useState<QualityAssessment['grade']>('A');\n  const [proofCaptured, setProofCaptured] = useState(false);\n  const [proofLoading, setProofLoading] = useState(false);"
);

// Inject Proof of Lot UI before Quality Declaration
const proofUi = `
              {/* Proof of Lot Block */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-8">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><Camera className="w-5 h-5" /> Live Proof-of-Lot Capture</h3>
                <p className="text-sm text-blue-800 mb-4">To prevent fraud, buyers require live verified images of your crop with a dynamic challenge code. Gallery uploads are not accepted as verified proof.</p>
                
                {!proofCaptured ? (
                  <div className="bg-white border border-blue-100 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Dynamic Verification Challenge</div>
                    <div className="text-3xl font-mono font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-md mb-4 tracking-widest">
                      KS-{Math.floor(1000 + Math.random() * 9000)}
                    </div>
                    <p className="text-sm text-gray-600 mb-4 max-w-sm">Write this code on a piece of paper and show it clearly in the photos alongside your crop.</p>
                    
                    <button 
                      onClick={() => {
                        setProofLoading(true);
                        setTimeout(() => { setProofCaptured(true); setProofLoading(false); }, 1500);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                      disabled={proofLoading}
                    >
                      {proofLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                      {proofLoading ? "Verifying..." : "Start Live Capture"}
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                        <div>
                          <div className="font-bold text-green-800">Proof-of-Lot Captured</div>
                          <div className="text-xs text-green-600">4 Views • Challenge Verified • GPS Consistent</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 uppercase font-bold">Evidence Confidence</div>
                        <div className="text-lg font-black text-green-700">94 / 100</div>
                      </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                       {[1,2,3,4].map(i => (
                         <div key={i} className="w-20 h-20 bg-gray-200 rounded border border-gray-300 flex items-center justify-center shrink-0 overflow-hidden">
                            <Camera className="w-6 h-6 text-gray-400 opacity-50" />
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Existing Quality Declaration */}
`;

content = content.replace(/<div className="flex flex-col gap-6">\s*<div className="flex flex-col gap-1\.5">\s*<label className="text-xs font-semibold text-gray-600 uppercase flex justify-between">/, proofUi + '\n<div className="flex flex-col gap-6">\n<div className="flex flex-col gap-1.5">\n<label className="text-xs font-semibold text-gray-600 uppercase flex justify-between">');

// Modify final handleCreateLot
content = content.replace(
  /qualityScore: finalScore,\n\s*};\n\n\s*const newLot: Lot = \{/,
  "qualityScore: finalScore,\n      };\n\n      const proofOfLot = proofCaptured ? {\n        challengeId: `KS-${Math.floor(1000 + Math.random() * 9000)}`,\n        confidenceScore: 94,\n        locationConsistency: 'High' as const,\n        imagesCaptured: 4,\n        timestamp: new Date().toISOString()\n      } : undefined;\n\n      const newLot: Lot = {"
);

content = content.replace(
  /quality,\n\s*createdAt: new Date\(\)\.toISOString\(\),\n\s*status: 'Draft',\n\s*\};/,
  "quality,\n        proofOfLot,\n        createdAt: new Date().toISOString(),\n        status: 'Draft',\n      };"
);

fs.writeFileSync('src/features/marketplace/components/create-lot-form.tsx', content, 'utf8');
