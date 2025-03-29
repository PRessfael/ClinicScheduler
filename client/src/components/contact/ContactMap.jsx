const ContactMap = () => {
  return (
    <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="h-64 bg-gray-200 w-full">
        {/* In a real application, this would be an actual map component */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <p className="text-gray-500 mt-2">Interactive Map</p>
            <p className="text-xs text-gray-400">(Map implementation would be integrated here)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactMap;
