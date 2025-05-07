// import { Badge } from "@/components/ui/badge";
// import foodPlaceholder from '../assets/food_placeholder.png';

// const MenuCard = ({ item, onClick }) => {
//   return (
//     <div 
//       className="rounded-xl p-4 shadow-sm bg-[#ebf6f7] hover:bg-[#bde6ea] transition-colors cursor-pointer h-full"
//       onClick={() => onClick(item)}
//     >
//       <div className="flex flex-row items-start h-full space-x-4">
//         <div className="flex-shrink-0">
//           <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-md">
//             <img
//               src={item.food_info?.item_photo_link || foodPlaceholder}
//               alt={item.food_info?.item_name || "Food item"}
//               className="object-cover w-full h-full"
//             />
//           </div>
//         </div>

//         <div className="flex flex-col flex-grow">
//           <h3 className="font-medium text-xl mb-3">
//             {item.food_info?.item_name || "Unnamed Item"}
//           </h3>

//           <div className="flex flex-wrap gap-2 mb-3">
//             {item.food_info?.veg && (
//               <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
//                 Vegetarian
//               </Badge>
//             )}
//             {item.food_info?.vegan && (
//               <Badge variant="secondary" className="bg-teal-100 text-teal-800 hover:bg-teal-200">
//                 Vegan
//               </Badge>
//             )}
//             {item.food_info?.gluten_free && (
//               <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
//                 Gluten Free
//               </Badge>
//             )}
//             {item.counter && (
//               <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
//                 {item.counter}
//               </Badge>
//             )}
//           </div>

//           {item.food_info?.allergens?.length > 0 && (
//             <div className="mt-auto pt-3 border-t border-gray-200">
//               <p className="text-sm text-gray-600 hover:text-gray-800">
//                 <span className="font-semibold">Allergens: </span> 
//                 {item.food_info.allergens.join(", ")}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MenuCard;

import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { addFavorite, removeFavorite } from "../api/favorites";
import foodPlaceholder from '../assets/food_placeholder.png';
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DAY_ORDER = {
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6,
  'Sunday': 7
};

const MenuCard = ({ item, onClick, isFavorited: isFavoritedProp, onFavoriteUpdate }) => {
  const { user } = useUser();
  const [isFavorited, setIsFavorited] = useState(isFavoritedProp);

  // ✅ Sync prop from parent (on refresh, when state is passed from Dashboard)
  useEffect(() => {
    setIsFavorited(isFavoritedProp);
  }, [isFavoritedProp]);

  const sortDays = (days) => {
    return [...days].sort((a, b) => {
      const dayA = a.trim();
      const dayB = b.trim();
      return (DAY_ORDER[dayA] || 999) - (DAY_ORDER[dayB] || 999);
    });
  };

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // prevent card click
    if (!user?.id || !item?.food_info?.id) return;

    try {
      if (isFavorited) {
        await removeFavorite(user.id, item.food_info.id);
        setIsFavorited(false);
      } else {
        await addFavorite(user.id, item.food_info.id);
        setIsFavorited(true);
      }
      if (onFavoriteUpdate) onFavoriteUpdate();

    } catch (err) {
      console.error("Favorite toggle failed:", err);
    }
  };

  return (
    <div
      className="relative group rounded-xl p-4 shadow-sm bg-[#ebf6f7] hover:bg-[#bde6ea] transition-colors cursor-pointer h-full"
      onClick={() => onClick(item)}
    >
      {/* ⭐️ Favorite Button */}
      <button
        onClick={toggleFavorite}
        className="absolute top-3 right-3 z-20"
        aria-label="Toggle favorite"
      >
        <Star
          className="w-5 h-5"
          fill={isFavorited ? "#95ae45" : "none"}
          stroke="#95ae45"
          strokeWidth={1.5}
        />
      </button>

      <div className="flex flex-row items-start h-full space-x-4">
        <div className="flex-shrink-0">
          <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-md">
            <img
              src={item.food_info?.item_photo_link || foodPlaceholder}
              alt={item.food_info?.item_name || "Food item"}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        <div className="flex flex-col flex-grow">
          <h3 className="font-medium text-xl mb-3">
            {item.food_info?.item_name || "Unnamed Item"}
          </h3>

          <div className="flex flex-wrap gap-2 mb-3">
            {item.food_info?.veg && (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                Vegetarian
              </Badge>
            )}
            {item.food_info?.vegan && (
              <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-200">
                Vegan
              </Badge>
            )}
            {item.food_info?.gluten_free && (
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                Gluten Free
              </Badge>
            )}
            {item.counter && (
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                {item.counter}
              </Badge>
            )}
          </div>

          {item.food_info?.allergens?.length > 0 && (
            <div className="mt-auto pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 hover:text-gray-800">
                <span className="font-semibold">Allergens: </span>
                {item.food_info.allergens.join(", ")}
              </p>
            </div>
          )}
          
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-sm text-gray-600 hover:text-gray-800">
              <span className="font-semibold">Available: </span>
              {item.days_available?.length > 0 
                ? sortDays(item.days_available).join(", ")
                : item.day || item.date_available || "Not specified"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
