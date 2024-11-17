import CanvasComponent from "../utils/canvas";

const CanvasPage = () => {
    // Placeholder function for saving current frame data
    
    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar */}
            

            {/* Main Content */}
            <div className="flex flex-1">
                {/* Left Tools Panel */}
                

                {/* Canvas Center */}
                    <div className="flex-1 flex items-center justify-center bg-gray-50 bg-white shadow-md p-4">
                        <CanvasComponent
                            
                        />
                    </div>

                
            </div>
        </div>
    );
};

export default CanvasPage;
