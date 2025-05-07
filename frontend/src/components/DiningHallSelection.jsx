const DiningHallSelection = ({ diningHalls, onSelect }) => {
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-medium text-left">Please select your dining hall:</h2>

      <div className="flex flex-col gap-4">
        {diningHalls.map((hall) => (
          <button
            key={hall}
            onClick={() => onSelect(hall)}
            className="w-full p-6 rounded-xl shadow-sm bg-[#ebf6f7] hover:bg-[#bde6ea] transition-colors text-center cursor-pointer"
          >
            <div className="text-xl font-medium">{hall}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DiningHallSelection;
