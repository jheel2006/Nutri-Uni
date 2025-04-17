import { X } from "lucide-react";

export const NutritionInfo = ({ item, open, onClose }) => {
  if (!open || !item?.food_info) return null;

  const nutrition = item.food_info;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div 
        className="bg-gray-50 rounded-xl shadow-lg max-w-md w-full p-6 mx-4 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Nutritional Information</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">Each 100 g portion contains</p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left pb-2 text-gray-700">ENERGY</th>
                  <th className="text-left pb-2 text-gray-700">FATS</th>
                  <th className="text-left pb-2 text-gray-700">PROTEIN</th>
                  <th className="text-left pb-2 text-gray-700">SUGAR</th>
                  <th className="text-left pb-2 text-gray-700">SALT</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-800"><strong>{nutrition.energy || '--'} kcal</strong></td>
                  <td className="py-3 text-gray-800"><strong>{nutrition.fats || '--'} g</strong></td>
                  <td className="py-3 text-gray-800"><strong>{nutrition.protein || '--'} g</strong></td>
                  <td className="py-3 text-gray-800"><strong>{nutrition.sugar || '--'} g</strong></td>
                  <td className="py-3 text-gray-800"><strong>{nutrition.salt || '--'} g</strong></td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-800"><strong>{nutrition.energy_kj || '--'} kJ</strong></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-800"><strong>{nutrition.energy_percent || '--'}%</strong></td>
                  <td className="py-3 text-gray-800"><strong>{nutrition.fats_percent || '--'}%</strong></td>
                  <td className="py-3 text-gray-800"><strong>{nutrition.protein_percent || '--'}%</strong></td>
                  <td className="py-3 text-gray-800"><strong>{nutrition.sugar_percent || '--'}%</strong></td>
                  <td className="py-3 text-gray-800"><strong>{nutrition.salt_percent || '--'}%</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};