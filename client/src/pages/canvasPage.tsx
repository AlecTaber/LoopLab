import CanvasComponent from "../utils/canvas";

const CanvasPage = () => {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar goes here */}
            <div className="w-full h-16 bg-gray-800 text-white flex items-center justify-center">
                Navbar
            </div>

            {/* Timeline just below the navbar */}
            <div className="w-full bg-gray-200 py-4 text-center">
                Timeline
            </div>

            {/* Main Content */}
            <div className="flex flex-1">
                {/* Left Tools Panel */}
                <div className="w-1/6 bg-gray-100 p-4 flex flex-col items-center">
                    {/* Tools (Brush Size, Color Picker, etc.) */}
                    <div className="mb-4">
                        <label>Brush Size</label>
                        <input type="text" className="mt-1 p-2 border rounded"/>
                    </div>
                    <div className="mb-4">
                        <label>Color Picker</label>
                        {/* Add the color picker component here */}
                    </div>
                    <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">New Frame</button>
                    <button className="mt-4 bg-red-500 text-white py-2 px-4 rounded">Clear</button>
                </div>

                {/* Canvas Center */}
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <CanvasComponent />
                </div>

                {/* Right Play Button Panel */}
                <div className="w-1/6 bg-gray-100 p-4 flex flex-col items-center">
                </div>
            </div>
        </div>
    );
};

export default CanvasPage;
