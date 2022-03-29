export const parameters = {
    backgrounds: {
        disable: true,
        grid: {
            disable: true
        }
    },
    previewTabs: {
        docs: {
            hidden: false
        }
        // // canvas里更新变量以后canvas不重新渲染，就先把它禁止了
        // canvas: {
        //     title: 'Story',
        //     hidden: true
        // }
    },
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/
        }
    }
};
