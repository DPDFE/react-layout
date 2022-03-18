import { useState } from "react";
import ReactDOM from "react-dom";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useNavigate,
    useLocation,
} from "react-router-dom";

import DefaultLayout from "./example/default";
import DraggableGridStaticLayout from "./example/draggable/grid/static";
import DraggableGridResponsiveLayout from "./example/draggable/grid/adaptive";
import DraggableDragStaticLayout from "./example/draggable/drag/static";
import DraggableDragResponsiveLayout from "./example/draggable/drag/adaptive";

import ResizableGridStaticLayout from "./example/resizable/grid/static";
import ResizableGridResponsiveLayout from "./example/resizable/grid/adaptive";
import ResizableDragStaticLayout from "./example/resizable/drag/static";
import ResizableDragResponsiveLayout from "./example/resizable/drag/adaptive";

import DropDragStaticLayout from "./example/drop/drag/static";
import DropGridResponsiveLayout from "./example/drop/grid/adaptive";

import NestedGridResponsiveLayout from "./example/nested/grid/adaptive";
import ChangeDragLayout from "./example/change";
import RulerLayout from "./example/ruler";
import { Menu } from "antd";

import { LayoutIcon } from "./example/component/icon";
import Sider from "antd/lib/layout/Sider";
import "./index.css";
import React from "react";

function Router() {
    const { SubMenu } = Menu;
    const history = useNavigate();
    const location = useLocation();
    const [selected_key, setSelectedKey] = useState<string>(location.pathname);
    const [collapsed, toggleCollapsed] = useState<boolean>(true);

    /* draggable */
    const draggable_lists = [
        {
            index: 1,
            name: "grid static",
            path: "/draggable/grid-static",
            element: <DraggableGridStaticLayout />,
        },
        {
            index: 2,
            name: "grid responsive",
            path: "/draggable/grid-responsive",
            element: <DraggableGridResponsiveLayout />,
        },
        {
            index: 3,
            name: "drag static",
            path: "/draggable/drag-static",
            element: <DraggableDragStaticLayout />,
        },
        {
            index: 4,
            name: "drag responsive",
            path: "/draggable/drag-responsive",
            element: <DraggableDragResponsiveLayout />,
        },
    ];

    /* resizable */
    const resizable_lists = [
        {
            index: 5,
            name: "grid static",
            path: "/resizable/grid-static",
            element: <ResizableGridStaticLayout />,
        },
        {
            index: 6,
            name: "grid responsive",
            path: "/resizable/grid-responsive",
            element: <ResizableGridResponsiveLayout />,
        },
        {
            index: 7,
            name: "drag static",
            path: "/resizable/drag-static",
            element: <ResizableDragStaticLayout />,
        },
        {
            index: 8,
            name: "drag responsive",
            path: "/resizable/drag-responsive",
            element: <ResizableDragResponsiveLayout />,
        },
    ];

    /* drop */
    const drop_lists = [
        {
            index: 9,
            name: "static",
            path: "/drop/drag-static",
            element: <DropDragStaticLayout />,
        },
        {
            index: 10,
            name: "responsive",
            path: "/drop/grid-responsive",
            element: <DropGridResponsiveLayout />,
        },
    ];

    const other_lists = [
        {
            index: 11,
            name: "nested grid responsive",
            path: "/nested",
            icon: "icon-nested",
            element: <NestedGridResponsiveLayout />,
        },
        {
            index: 12,
            name: "change",
            path: "/change",
            icon: "icon-change",
            element: <ChangeDragLayout />,
        },
        {
            index: 13,
            name: "ruler",
            path: "ruler",
            icon: "icon-ruler",
            element: <RulerLayout />,
        },
        {
            index: 14,
            name: "default",
            path: "/",
            icon: "icon-base",
            element: <DefaultLayout />,
        },
    ];

    return (
        <div style={{ display: "flex", width: "100%", height: "100%" }}>
            <Sider
                collapsible
                style={{ overflow: "auto" }}
                collapsed={collapsed}
                onCollapse={toggleCollapsed}
            >
                <Menu
                    theme="dark"
                    inlineCollapsed={collapsed}
                    onClick={(e) => {
                        setSelectedKey(e.key);
                        history(e.key);
                    }}
                    selectedKeys={[selected_key]}
                    mode="inline"
                    openKeys={
                        collapsed
                            ? undefined
                            : ["draggable", "resizable", "drop"]
                    }
                >
                    <Menu.Item
                        disabled
                        key="name"
                        icon={<LayoutIcon type={"icon-menu"} />}
                    >
                        demo menu
                    </Menu.Item>
                    <SubMenu
                        key="draggable"
                        title="draggable"
                        icon={<LayoutIcon type={"icon-draggable"} />}
                    >
                        {draggable_lists.map((r, i) => {
                            return (
                                <Menu.Item key={r.path}>
                                    {r.index}.{r.name}
                                </Menu.Item>
                            );
                        })}
                    </SubMenu>
                    <SubMenu
                        key="resizable"
                        title="resizable"
                        icon={<LayoutIcon type={"icon-resize"} />}
                    >
                        {resizable_lists.map((r, i) => {
                            return (
                                <Menu.Item key={r.path}>
                                    {r.index}.{r.name}
                                </Menu.Item>
                            );
                        })}
                    </SubMenu>
                    <SubMenu
                        key="drop"
                        title="drop"
                        icon={<LayoutIcon type={"icon-dropbox"} />}
                    >
                        {drop_lists.map((r, i) => {
                            return (
                                <Menu.Item key={r.path}>
                                    {r.index}.{r.name}
                                </Menu.Item>
                            );
                        })}
                    </SubMenu>
                    {other_lists.map((r, i) => {
                        return (
                            <Menu.Item
                                key={r.path}
                                icon={<LayoutIcon type={r.icon!} />}
                            >
                                {r.index}.{r.name}
                            </Menu.Item>
                        );
                    })}
                </Menu>
            </Sider>

            <div style={{ flex: 1, overflow: "hidden" }}>
                <Routes>
                    {[
                        ...draggable_lists,
                        ...resizable_lists,
                        ...drop_lists,
                        ...other_lists,
                    ].map((r) => {
                        return (
                            <Route
                                key={r.name}
                                path={r.path}
                                element={r.element}
                            />
                        );
                    })}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </div>
    );
}

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <Router />
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById("root")
);
