import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import foodPlaceholder from '../assets/food_placeholder.png';

const MenuCard = ({ item, onClick }) => {
  return (
    <div 
      className="rounded-xl p-4 shadow-sm bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
      onClick={() => onClick(item)}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <Avatar className="h-20 w-20 rounded-lg bg-white">
            <img
              src={item.food_info?.item_photo_link || foodPlaceholder}
              alt={item.food_info?.item_name || "Food item"}
              className="object-cover w-full h-full rounded-lg"
            />
          </Avatar>
        </div>
        
        <div className="flex flex-col w-full">
          <h3 className="font-medium text-lg mb-2">
            {item.food_info?.item_name || "Unnamed"}
          </h3>
          
          <div className="flex flex-wrap gap-2 mb-2">
            {item.food_info?.veg && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Vegetarian
              </Badge>
            )}
            {item.food_info?.vegan && (
              <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                Vegan
              </Badge>
            )}
            {item.food_info?.gluten_free && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Gluten Free
              </Badge>
            )}
            {item.counter && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {item.counter}
              </Badge>
            )}
          </div>
          
          {item.food_info?.allergens?.length > 0 && (
            <div className="mt-auto">
              <p className="text-xs text-gray-600">
                <span className="font-medium">Allergens:</span> {item.food_info.allergens.join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCard;