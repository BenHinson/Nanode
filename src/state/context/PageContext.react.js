import React, { createContext, useState, useMemo, useEffect } from "react"

export const PageContext = createContext([]);

export function PageProvider(props) {
    const [activePage, setActivePage] = useState('home');

    // const [spans, setSpans] = useState({});
    // const [nodes, setNodes] = useState({});
    // const [nodeSelected, setNodeSelected] = useState(new Set());

    // const [nodeId, setNodeId] = useState('home');
    // const [nodeName, setNodeName] = useState('home');

    // ===========================
    
    // useEffect(() => {
    //   (async() => {
    //     new Main(nodeId);
    //   })()
    // }, []);

    // ===========================

    return (
      <PageContext.Provider value={[
        activePage, setActivePage,
        // spans, setSpans,
        // nodes, setNodes,
        // nodeSelected, setNodeSelected,
        // nodeId, setNodeId,
        // nodeName, setNodeName,
      ]}>
        {props.children}
      </PageContext.Provider>
    )
}