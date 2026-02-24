import { Routes, Route, Navigate } from 'react-router-dom';
import GridTool from './tools/grid/GridTool';
import ArrowyTool from './tools/arrowy/ArrowyTool';
import ToolMenu from './components/ToolMenu';

export default function App() {
  return (
    <>
      <ToolMenu />
      <Routes>
        <Route path="/grid" element={<GridTool />} />
        <Route path="/arrowy" element={<ArrowyTool />} />
        <Route path="*" element={<Navigate to="/arrowy" replace />} />
      </Routes>
    </>
  );
}
