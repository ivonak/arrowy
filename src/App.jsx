import { Routes, Route, Navigate } from 'react-router-dom';
import GridTool from './tools/grid/GridTool';
import ArrowyTool from './tools/arrowy/ArrowyTool';
import BgGrainTool from './tools/bgGrain/BgGrainTool';
import LearningTool from './tools/learning/LearningTool';
import ToolMenu from './components/organisms/ToolMenu';

export default function App() {
  return (
    <>
      <ToolMenu />
      <Routes>
        <Route path="/grid" element={<GridTool />} />
        <Route path="/arrowy" element={<ArrowyTool />} />
        <Route path="/bg-grain" element={<BgGrainTool />} />
        <Route path="/learning" element={<LearningTool />} />
        <Route path="*" element={<Navigate to="/arrowy" replace />} />
      </Routes>
    </>
  );
}
