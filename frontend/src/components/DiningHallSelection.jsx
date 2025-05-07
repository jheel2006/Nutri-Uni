// const DiningHallSelection = ({ diningHalls, onSelect }) => {
//   return (
//     <div className="space-y-8">
//       <h2 className="text-xl font-medium text-left">Please select your dining hall:</h2>

//       <div className="flex flex-col gap-4">
//         {diningHalls.map((hall) => (
//           <button
//             key={hall}
//             onClick={() => onSelect(hall)}
//             className="w-full p-6 rounded-xl shadow-sm bg-[#ebf6f7] hover:bg-[#bde6ea] transition-colors text-center cursor-pointer"
//           >
//             <div className="text-xl font-medium">{hall}</div>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default DiningHallSelection;


// DiningHallSelection.jsx
import d1Img from "@/assets/halls/d1.png";
import d2Img from "@/assets/halls/d2.png";
import marketplaceImg from "@/assets/halls/mkp.png";

const hallImages = {
  D1: d1Img,
  D2: d2Img,
  Marketplace: marketplaceImg,
};

export default function DiningHallSelection({ diningHalls, onSelect }) {
  return (
    <div className="space-y-8">
    <h2 className="text-xl font-medium text-left">Please select your dining hall:</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {diningHalls.map((hall) => (
        <div
          key={hall}
          onClick={() => onSelect(hall)}
          className="cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all bg-[#ebf6f7]"
//           >"
        >
          <img
            src={hallImages[hall]}
            alt={hall}
            className="w-full h-48 object-cover"
          />
          <div className="p-4 text-center text-lg font-semibold text-[#303030]">
            {hall}
          </div>
        </div>
      ))}
    </div>
    </div>
  );
}
