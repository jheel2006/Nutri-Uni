const DiningHallSelection = ({ diningHalls, onSelect }) => {
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-medium">Please select your dining hall</h2>
      <div className="flex flex-col gap-4">
        {diningHalls.map((hall) => (
          <button
            key={hall}
            onClick={() => onSelect(hall)}
            className="p-6 rounded-xl shadow-sm bg-gray-100 hover:bg-gray-200 transition-colors text-left w-full"
          >
            <div className="text-lg font-medium">{hall}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DiningHallSelection;