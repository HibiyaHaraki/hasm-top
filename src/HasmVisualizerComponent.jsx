import React, { useEffect, useRef, useState } from 'react';
import { createCommitGraph } from './generated/visualizer/threeCommitGraph.js';
import { DEFAULT_LAYOUT_FILTER, nextLayoutFilter, TIME_SCALE_MODES } from './generated/visualizer/layoutFilter.js';
import { computeVisualizerLayoutJS } from './generated/visualizer/layoutCalculator.js';
import { SAMPLE_HASM_MODELS } from './generated/visualizer/sampleModels.js';
import { getPatternById } from './hasm_color_pattern/src/index.js';
import { useColorTheme } from './theme/useColorTheme.js';
import { createLogger } from './hasm_logger/src/react/logger.js';

const logger = createLogger('hasm-3d-visualizer');

const visualizerStyles = `
  .HasmVisualizer_Container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 24px;
    padding: 24px;
    background: var(--theme-surface);
    border: 1px solid var(--theme-border);
  }

  .HasmVisualizer_Toolbar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--theme-border);
  }

  .HasmVisualizer_ControlGroup {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
  }

  .HasmVisualizer_Label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--theme-text);
  }

  .HasmVisualizer_Select,
  .HasmVisualizer_Input {
    padding: 6px 12px;
    font-size: 0.85rem;
    font-family: inherit;
    color: var(--theme-text);
    background: var(--theme-input-bg, var(--theme-soft));
    border: 1px solid var(--theme-border);
  }

  .HasmVisualizer_Stage {
    position: relative;
    width: 100%;
    height: 480px;
    background: var(--theme-textbackground);
    border: 1px solid var(--theme-border);
    overflow: hidden;
  }

  .HasmVisualizer_Canvas {
    width: 100%;
    height: 100%;
  }

  .HasmVisualizer_Tooltip {
    position: fixed;
    pointer-events: none;
    z-index: 1000;
    padding: 6px 12px;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--theme-on-accent);
    background: var(--theme-primary);
    border: 1px solid var(--theme-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transform: translate(12px, 12px);
  }

  .HasmVisualizer_Legend {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    padding: 12px 16px;
    background: var(--theme-soft);
    border: 1px solid var(--theme-border);
    font-size: 0.8rem;
    font-weight: 700;
  }

  .HasmVisualizer_LegendItem {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .HasmVisualizer_LegendDot {
    width: 12px;
    height: 12px;
    border-radius: 2px;
  }

  .HasmVisualizer_Inspector {
    padding: 16px;
    background: var(--theme-soft);
    border: 1px solid var(--theme-border);
    border-left: 4px solid var(--theme-primary);
  }

  .HasmVisualizer_InspectorTitle {
    font-family: Georgia, serif;
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 6px;
  }

  .HasmVisualizer_InspectorMeta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 0.8rem;
    color: var(--theme-muted);
  }
`;

export function HasmVisualizerComponent({ labels }) {
  const { colorPattern } = useColorTheme();
  const sceneRef = useRef(null);
  const disposeSceneRef = useRef(() => {});

  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [filter, setFilter] = useState(DEFAULT_LAYOUT_FILTER);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const currentSample = SAMPLE_HASM_MODELS[selectedModelIndex] || SAMPLE_HASM_MODELS[0];

  useEffect(() => {
    if (!sceneRef.current) return;

    logger.debug('Rendering 3D commit graph', {
      modelName: currentSample.fileName,
      filter,
      pattern: colorPattern,
    });

    // Compute layout using client-side JS implementation synced from submodules/hasm
    const layoutPayload = computeVisualizerLayoutJS(currentSample.model, filter);

    // Get theme color palette
    const themeColors = getPatternById(colorPattern).colors;

    // Clean up previous Three.js instance
    disposeSceneRef.current();

    // Instantiate 3D graph via Three.js engine from submodules/hasm
    disposeSceneRef.current = createCommitGraph(
      sceneRef.current,
      layoutPayload,
      themeColors,
      (node) => {
        setSelectedNode(node);
        logger.info('Selected 3D node', { node });
      },
      (node, event) => {
        if (node) {
          setHoveredNode({ ...node, x: event.clientX, y: event.clientY });
        } else {
          setHoveredNode(null);
        }
      }
    );

    return () => {
      disposeSceneRef.current();
    };
  }, [selectedModelIndex, filter, colorPattern, currentSample]);

  return (
    <div className="HasmVisualizer_Container">
      <style>{visualizerStyles}</style>

      {/* TOOLBAR CONTROLS */}
      <div className="HasmVisualizer_Toolbar">
        <div className="HasmVisualizer_ControlGroup">
          <label className="HasmVisualizer_Label">
            {labels?.sampleModel || 'Example .hasm Package'}:
            <select
              className="HasmVisualizer_Select"
              value={selectedModelIndex}
              onChange={(e) => {
                setSelectedModelIndex(Number(e.target.value));
                setSelectedNode(null);
              }}
            >
              {SAMPLE_HASM_MODELS.map((sample, idx) => (
                <option key={sample.fileName} value={idx}>
                  📂 {sample.fileName} — {sample.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="HasmVisualizer_ControlGroup">
          <label className="HasmVisualizer_Label">
            {labels?.timeScale || 'Time Scale'}:
            <select
              className="HasmVisualizer_Select"
              value={filter.timeScaleMode}
              onChange={(e) => setFilter(nextLayoutFilter(filter, 'timeScaleMode', e.target.value))}
            >
              {TIME_SCALE_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </label>

          <label className="HasmVisualizer_Label">
            {labels?.zScale || 'Z Scale'}:
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              className="HasmVisualizer_Input"
              value={filter.zScaleFactor}
              onChange={(e) => setFilter(nextLayoutFilter(filter, 'zScaleFactor', e.target.value))}
            />
            <span style={{ fontSize: '0.8rem', minWidth: '32px' }}>{filter.zScaleFactor}x</span>
          </label>
        </div>
      </div>

      {/* 3D GRAPH STAGE */}
      <div className="HasmVisualizer_Stage" aria-label="3D Commit Graph">
        <div className="HasmVisualizer_Canvas" ref={sceneRef} />

        {hoveredNode && (
          <div
            className="HasmVisualizer_Tooltip"
            style={{ left: hoveredNode.x, top: hoveredNode.y }}
          >
            [{hoveredNode.entityType}] {hoveredNode.label}
          </div>
        )}
      </div>

      {/* LEGEND */}
      <div className="HasmVisualizer_Legend">
        <div className="HasmVisualizer_LegendItem">
          <div className="HasmVisualizer_LegendDot" style={{ background: '#d6b25e' }} />
          PERSON (Box)
        </div>
        <div className="HasmVisualizer_LegendItem">
          <div className="HasmVisualizer_LegendDot" style={{ background: '#68a5d2' }} />
          EXPERIENCE (Box / Timeline Branch)
        </div>
        <div className="HasmVisualizer_LegendItem">
          <div className="HasmVisualizer_LegendDot" style={{ background: '#e08a65' }} />
          FACT (Sphere / Occurred Event)
        </div>
        <div style={{ marginLeft: 'auto', color: 'var(--theme-muted)', fontSize: '0.75rem', fontWeight: 'normal' }}>
          💡 Drag to rotate, scroll to zoom, click node to inspect
        </div>
      </div>

      {/* NODE INSPECTOR */}
      {selectedNode && (
        <div className="HasmVisualizer_Inspector">
          <div className="HasmVisualizer_InspectorTitle">
            [{selectedNode.entityType}] {selectedNode.label}
          </div>
          <div className="HasmVisualizer_InspectorMeta">
            <span>ID: {selectedNode.id}</span>
            <span>Position 3D: ({selectedNode.x.toFixed(1)}, {selectedNode.y.toFixed(1)}, {selectedNode.z.toFixed(1)})</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default HasmVisualizerComponent;
