import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "../pages/Welcome";
import Gallery from "../pages/Gallery";

const RoutingMain = () => {
  return (
    <BrowserRouter>
      <main className="bg-gray-100">
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <Welcome />
                <Gallery /> {/* Appears as user scrolls down */}
              </div>
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default RoutingMain;
