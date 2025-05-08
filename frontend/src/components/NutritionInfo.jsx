import { X } from "lucide-react";

export const NutritionInfo = ({ item, open, onClose }) => {
  if (!open || !item?.food_info) return null;

  const nutrition = item.food_info;

  const DAILY_VALUES = {
    energy: 2000,
    fats: 70,
    protein: 50,
    sugar: 30,
    salt: 6,
  };

  const energyPercent = ((nutrition.energy || 0) / DAILY_VALUES.energy) * 100;
  const fatsPercent = ((nutrition.fats || 0) / DAILY_VALUES.fats) * 100;
  const proteinPercent = ((nutrition.protein || 0) / DAILY_VALUES.protein) * 100;
  const sugarPercent = ((nutrition.sugar || 0) / DAILY_VALUES.sugar) * 100;
  const saltPercent = ((nutrition.salt || 0) / DAILY_VALUES.salt) * 100;


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
                  <td className="py-3 text-gray-800"><strong>{nutrition.energy} kcal</strong></td>
                  <td className="py-3 text-gray-800"><strong>{nutrition.fats} g</strong></td>
                  <td className="py-3 text-gray-800"><strong>{nutrition.protein} g</strong></td>
                  <td className="py-3 text-gray-800"><strong>{nutrition.sugar} g</strong></td>
                  <td className="py-3 text-gray-800"><strong>{nutrition.salt} g</strong></td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-800"><strong>{nutrition.energy_kj || '--'} kJ</strong></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-800"><strong>{energyPercent.toFixed(0)}%</strong></td>
                  <td className="py-3 text-gray-800"><strong>{fatsPercent.toFixed(0)}%</strong></td>
                  <td className="py-3 text-gray-800"><strong>{proteinPercent.toFixed(0)}%</strong></td>
                  <td className="py-3 text-gray-800"><strong>{sugarPercent.toFixed(0)}%</strong></td>
                  <td className="py-3 text-gray-800"><strong>{saltPercent.toFixed(0)}%</strong></td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};