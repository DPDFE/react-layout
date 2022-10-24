import {
    darken,
    fomatFloatNumber,
    getGrayLevel,
    lighten,
    toHsl,
    toRgb,
    range,
    luminance
} from '@dpdfe/event-utils';
import {
    getLuminance,
    _toRgba,
    RGB,
    RGBFormatType
} from '@dpdfe/event-utils/dist/color/torgba';

function Darken() {
    const colors: string[] = [
        '#426105',
        'rgb(22, 24, 25)',
        '#f0f8ff',
        '#faebd7',
        '#00ffff',
        '#7fffd4',
        '#f0ffff',
        '#f5f5dc',
        '#ffe4c4',
        '#000000',
        '#ffebcd',
        '#0000ff',
        '#8a2be2',
        '#a52a2a',
        '#deb887',
        '#5f9ea0',
        '#7fff00',
        '#d2691e',
        '#ff7f50',
        '#6495ed',
        '#fff8dc',
        '#dc143c',
        '#00008b',
        '#008b8b',
        '#b8860b',
        '#006400',
        '#a9a9a9',
        '#bdb76b',
        '#8b008b',
        '#556b2f',
        '#ff8c00',
        '#9932cc',
        '#8b0000',
        '#e9967a',
        '#8fbc8f',
        '#483d8b',
        '#2f4f4f',
        '#00ced1',
        '#9400d3',
        '#ff1493',
        '#00bfff',
        '#696969',
        '#1e90ff',
        '#b22222',
        '#fffaf0',
        '#228b22',
        '#ff00ff',
        '#dcdcdc',
        '#f8f8ff',
        '#ffd700',
        '#daa520',
        '#808080',
        '#008000',
        '#adff2f',
        '#f0fff0',
        '#ff69b4',
        '#cd5c5c',
        '#4b0082',
        '#fffff0',
        '#f0e68c',
        '#e6e6fa',
        '#fff0f5',
        '#7cfc00',
        '#fffacd',
        '#add8e6',
        '#f08080',
        '#e0ffff',
        '#fafad2',
        '#d3d3d3',
        '#90ee90',
        '#ffb6c1',
        '#ffa07a',
        '#20b2aa',
        '#87cefa',
        '#778899',
        '#b0c4de',
        '#ffffe0',
        '#00ff00',
        '#32cd32',
        '#faf0e6',
        '#800000',
        '#66cdaa',
        '#0000cd',
        '#ba55d3',
        '#9370db',
        '#3cb371',
        '#7b68ee',
        '#00fa9a',
        '#48d1cc',
        '#c71585',
        '#191970',
        '#f5fffa',
        '#ffe4e1',
        '#ffe4b5',
        '#ffdead',
        '#000080',
        '#fdf5e6',
        '#808000',
        '#6b8e23',
        '#ffa500',
        '#ff4500',
        '#da70d6',
        '#eee8aa',
        '#98fb98',
        '#afeeee',
        '#db7093',
        '#ffefd5',
        '#ffdab9',
        '#cd853f',
        '#ffc0cb',
        '#dda0dd',
        '#b0e0e6',
        '#800080',
        '#ff0000',
        '#bc8f8f',
        '#4169e1',
        '#8b4513',
        '#fa8072',
        '#f4a460',
        '#2e8b57',
        '#fff5ee',
        '#a0522d',
        '#c0c0c0',
        '#87ceeb',
        '#6a5acd',
        '#708090',
        '#fffafa',
        '#00ff7f',
        '#4682b4',
        '#d2b48c',
        '#008080',
        '#d8bfd8',
        '#ff6347',
        '#40e0d0',
        '#ee82ee',
        '#f5deb3',
        '#ffffff',
        '#f5f5f5',
        '#ffff00',
        '#9acd32'
    ];

    // const rgb_colors = ['rgba(0, 0, 0, 0.17)'];
    const rgb_colors = [
        'rgb(128,0,0, 0.9)',
        'rgb(139,0,0, 0.9)',
        'rgb(165,42,42, 0.9)',
        'rgb(178,34,34, 0.9)',
        'rgb(220,20,60, 0.9)',
        'rgb(255,0,0, 0.9)',
        'rgb(255,99,71, 0.9)',
        'rgb(255,127,80, 0.9)',
        'rgb(205,92,92, 0.9)',
        'rgb(240,128,128, 0.9)',
        'rgb(233,150,122, 0.9)',
        'rgb(250,128,114, 0.9)',
        'rgb(255,160,122, 0.9)',
        'rgb(255,69,0, 0.9)',
        'rgb(255,140,0, 0.9)',
        'rgb(255,165,0, 0.9)',
        'rgb(255,215,0, 0.9)',
        'rgb(184,134,11, 0.9)',
        'rgb(218,165,32, 0.9)',
        'rgb(238,232,170, 0.9)',
        'rgb(189,183,107, 0.9)',
        'rgb(240,230,140, 0.9)',
        'rgb(128,128,0, 0.9)',
        'rgb(255,255,0, 0.9)',
        'rgb(154,205,50, 0.9)',
        'rgb(85,107,47, 0.9)',
        'rgb(107,142,35, 0.9)',
        'rgb(124,252,0, 0.9)',
        'rgb(127,255,0, 0.9)',
        'rgb(173,255,47, 0.9)',
        'rgb(0,100,0, 0.9)',
        'rgb(0,128,0, 0.9)',
        'rgb(34,139,34, 0.9)',
        'rgb(0,255,0, 0.9)',
        'rgb(50,205,50, 0.9)',
        'rgb(144,238,144, 0.9)',
        'rgb(152,251,152, 0.9)',
        'rgb(143,188,143, 0.9)',
        'rgb(0,250,154, 0.9)',
        'rgb(0,255,127, 0.9)',
        'rgb(46,139,87, 0.9)',
        'rgb(102,205,170, 0.9)',
        'rgb(60,179,113, 0.9)',
        'rgb(32,178,170, 0.9)',
        'rgb(47,79,79, 0.9)',
        'rgb(0,128,128, 0.9)',
        'rgb(0,139,139, 0.9)',
        'rgb(0,255,255, 0.9)',
        'rgb(224,255,255, 0.9)',
        'rgb(0,206,209, 0.9)',
        'rgb(64,224,208, 0.9)',
        'rgb(72,209,204, 0.9)',
        'rgb(175,238,238, 0.9)',
        'rgb(127,255,212, 0.9)',
        'rgb(176,224,230, 0.9)',
        'rgb(95,158,160, 0.9)',
        'rgb(70,130,180, 0.9)',
        'rgb(100,149,237, 0.9)',
        'rgb(0,191,255, 0.9)',
        'rgb(30,144,255, 0.9)',
        'rgb(173,216,230, 0.9)',
        'rgb(135,206,235, 0.9)',
        'rgb(135,206,250, 0.9)',
        'rgb(25,25,112, 0.9)',
        'rgb(0,0,128, 0.9)',
        'rgb(0,0,139, 0.9)',
        'rgb(0,0,205, 0.9)',
        'rgb(0,0,255, 0.9)',
        'rgb(65,105,225, 0.9)',
        'rgb(138,43,226, 0.9)',
        'rgb(75,0,130, 0.9)',
        'rgb(72,61,139, 0.9)',
        'rgb(106,90,205, 0.9)',
        'rgb(123,104,238, 0.9)',
        'rgb(147,112,219, 0.9)',
        'rgb(139,0,139, 0.9)',
        'rgb(148,0,211, 0.9)',
        'rgb(153,50,204, 0.9)',
        'rgb(186,85,211, 0.9)',
        'rgb(128,0,128, 0.9)',
        'rgb(216,191,216, 0.9)',
        'rgb(221,160,221, 0.9)',
        'rgb(238,130,238, 0.9)',
        'rgb(255,0,255, 0.9)',
        'rgb(218,112,214, 0.9)',
        'rgb(199,21,133, 0.9)',
        'rgb(219,112,147, 0.9)',
        'rgb(255,20,147, 0.9)',
        'rgb(255,105,180, 0.9)',
        'rgb(255,182,193, 0.9)',
        'rgb(255,192,203, 0.9)',
        'rgb(250,235,215, 0.9)',
        'rgb(245,245,220, 0.9)',
        'rgb(255,228,196, 0.9)',
        'rgb(255,235,205, 0.9)',
        'rgb(245,222,179, 0.9)',
        'rgb(255,248,220, 0.9)',
        'rgb(255,250,205, 0.9)',
        'rgb(250,250,210, 0.9)',
        'rgb(255,255,224, 0.9)',
        'rgb(139,69,19, 0.9)',
        'rgb(160,82,45, 0.9)',
        'rgb(210,105,30, 0.9)',
        'rgb(205,133,63, 0.9)',
        'rgb(244,164,96, 0.9)',
        'rgb(222,184,135, 0.9)',
        'rgb(210,180,140, 0.9)',
        'rgb(188,143,143, 0.9)',
        'rgb(255,228,181, 0.9)',
        'rgb(255,222,173, 0.9)',
        'rgb(255,218,185, 0.9)',
        'rgb(255,228,225, 0.9)',
        'rgb(255,240,245, 0.9)',
        'rgb(250,240,230, 0.9)',
        'rgb(253,245,230, 0.9)',
        'rgb(255,239,213, 0.9)',
        'rgb(255,245,238, 0.9)',
        'rgb(245,255,250, 0.9)',
        'rgb(112,128,144, 0.9)',
        'rgb(119,136,153, 0.9)',
        'rgb(176,196,222, 0.9)',
        'rgb(230,230,250, 0.9)',
        'rgb(255,250,240, 0.9)',
        'rgb(240,248,255, 0.9)',
        'rgb(248,248,255, 0.9)',
        'rgb(240,255,240, 0.9)',
        'rgb(255,255,240, 0.9)',
        'rgb(240,255,255, 0.9)',
        'rgb(255,250,250, 0.9)',
        'rgb(0,0,0, 0.9)',
        'rgb(105,105,105, 0.9)',
        'rgb(128,128,128, 0.9)',
        'rgb(169,169,169, 0.9)',
        'rgb(192,192,192, 0.9)',
        'rgb(211,211,211, 0.9)',
        'rgb(220,220,220, 0.9)',
        'rgb(245,245,245, 0.9)',
        'rgb(255,255,255, 0.9)'
    ];

    return (
        <div style={{ height: '100%', width: '100%', overflow: 'auto' }}>
            <p style={{ margin: 20, fontWeight: 600 }}>canvas color</p>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    flexWrap: 'wrap'
                }}
            >
                {range(
                    [
                        'rgb(205, 99, 201)',
                        'rgb(33, 126, 74)',
                        'rgb(255, 78, 13)',
                        'rgb(61, 176, 247)'
                    ],
                    {
                        total: 20
                    }
                ).map((c: string) => {
                    const { red, green, blue, alpha } = _toRgba(c, {
                        backgroundColor: '#ffffff',
                        format: RGBFormatType.Object
                    });
                    return (
                        <div
                            key={c}
                            style={{
                                marginLeft: 20,
                                marginBottom: 20,
                                display: 'flex',
                                justifyContent: 'flex-start',
                                flexWrap: 'wrap'
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: `rgba(${red}, ${green}, ${blue}, ${alpha})`,
                                    width: 30,
                                    height: 30
                                }}
                            ></div>
                        </div>
                    );
                })}
            </div>

            <p style={{ margin: 20, fontWeight: 600 }}>range recommended</p>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    flexWrap: 'wrap'
                }}
            >
                {range(
                    [
                        'rgb(205, 99, 201)',
                        'rgb(33, 126, 74)',
                        'rgb(255, 78, 13)',
                        'rgb(61, 176, 247)'
                    ],
                    {
                        total: 20
                    }
                ).map((c: string) => {
                    return (
                        <div
                            key={c}
                            style={{
                                marginLeft: 20,
                                marginBottom: 20,
                                display: 'flex',
                                justifyContent: 'flex-start',
                                flexWrap: 'wrap'
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: c,
                                    width: 30,
                                    height: 30
                                }}
                            ></div>
                        </div>
                    );
                })}
            </div>

            <p style={{ margin: 20, fontWeight: 600 }}>range HSL</p>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    flexWrap: 'wrap'
                }}
            >
                {[
                    -100, -90, -80, -70, -60, -50, -40, -30, -20, -10, 0, 10,
                    20, 30, 40, 50, 60, 70, 80, 90, 100
                ].map((percent) => {
                    return (
                        <div
                            key={percent}
                            style={{
                                marginLeft: 20,
                                marginBottom: 20,
                                display: 'flex',
                                justifyContent: 'flex-start',
                                flexWrap: 'wrap'
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: luminance(
                                        'rgb(205, 99, 201)',

                                        {
                                            percent,
                                            is_full: true,
                                            max: 'rgb(205, 99, 201)',
                                            min: 'rgb(33, 126, 74)'
                                        }
                                    ),
                                    width: 30,
                                    height: 30
                                }}
                            ></div>
                            {/* <pre style={{ fontSize: 12, marginTop: 5 }}>
                                {luminance(
                                    'rgb(205, 99, 201)',

                                    {
                                        percent,
                                        max: 'rgb(205, 99, 201)',
                                        min: 'rgb(33, 126, 74)'
                                    }
                                )}
                            </pre> */}
                        </div>
                    );
                })}
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    flexWrap: 'wrap'
                }}
            >
                {[
                    -100, -90, -80, -70, -60, -50, -40, -30, -20, -10, 0, 10,
                    20, 30, 40, 50, 60, 70, 80, 90, 100
                ].map((percent) => {
                    return (
                        <div
                            key={percent}
                            style={{
                                marginLeft: 20,
                                marginBottom: 20,
                                display: 'flex',
                                justifyContent: 'flex-start',
                                flexWrap: 'wrap',
                                flexDirection: 'column'
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: luminance(
                                        'rgb(205, 99, 201)',

                                        {
                                            percent
                                        }
                                    ),
                                    width: 30,
                                    height: 30
                                }}
                            ></div>
                            <pre style={{ fontSize: 12, marginTop: 5 }}>
                                {percent}
                            </pre>
                        </div>
                    );
                })}
            </div>

            <p style={{ margin: 20, fontWeight: 600 }}>range RGB</p>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    flexWrap: 'wrap'
                }}
            >
                {[
                    -100, -90, -80, -70, -60, -50, -40, -30, -20, -10, 0, 10,
                    20, 30, 40, 50, 60, 70, 80, 90, 100
                ].map((percent) => {
                    return (
                        <div
                            key={percent}
                            style={{
                                marginLeft: 20,
                                marginBottom: 20,
                                display: 'flex',
                                justifyContent: 'flex-start',
                                flexWrap: 'wrap'
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: darken(
                                        'rgb(205, 99, 201)',

                                        {
                                            percent,
                                            max: 'rgb(205, 99, 201)',
                                            min: 'rgb(33, 126, 74)'
                                        }
                                    ),
                                    width: 30,
                                    height: 30
                                }}
                            ></div>
                        </div>
                    );
                })}
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    flexWrap: 'wrap'
                }}
            >
                {[
                    -100, -90, -80, -70, -60, -50, -40, -30, -20, -10, 0, 10,
                    20, 30, 40, 50, 60, 70, 80, 90, 100
                ].map((percent) => {
                    return (
                        <div
                            key={percent}
                            style={{
                                marginLeft: 20,
                                marginBottom: 20,
                                display: 'flex',
                                justifyContent: 'flex-start',
                                flexWrap: 'wrap',
                                flexDirection: 'column'
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: darken(
                                        'rgb(205, 99, 201)',

                                        {
                                            percent
                                        }
                                    ),
                                    width: 30,
                                    height: 30
                                }}
                            ></div>
                            <pre style={{ fontSize: 12, marginTop: 5 }}>
                                {percent}
                            </pre>
                        </div>
                    );
                })}
            </div>

            <p style={{ margin: 20, fontWeight: 600 }}>brightness hsl</p>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    flexWrap: 'wrap'
                }}
            >
                {colors.map((c) => {
                    return (
                        <div
                            key={c}
                            style={{
                                marginLeft: 20,
                                marginBottom: 20,
                                display: 'flex',
                                justifyContent: 'flex-start',
                                flexWrap: 'wrap'
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: luminance(c, {
                                        percent: 20
                                    }),
                                    width: 30,
                                    height: 30
                                }}
                            ></div>
                            <div
                                style={{
                                    backgroundColor: c,
                                    width: 30,
                                    height: 30
                                }}
                            ></div>
                            <div
                                style={{
                                    backgroundColor: luminance(c, {
                                        percent: -20
                                    }),
                                    width: 30,
                                    height: 30
                                }}
                            ></div>
                        </div>
                    );
                })}
            </div>

            <p style={{ margin: 20, fontWeight: 600 }}>brightness rgb</p>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    flexWrap: 'wrap'
                }}
            >
                {colors.map((c) => {
                    return (
                        <div
                            key={c}
                            style={{
                                marginLeft: 20,
                                marginBottom: 20,
                                display: 'flex',
                                justifyContent: 'flex-start',
                                flexWrap: 'wrap'
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: darken(c, {
                                        percent: 20
                                    }),
                                    width: 30,
                                    height: 30
                                }}
                            ></div>

                            <div
                                style={{
                                    backgroundColor: c,
                                    width: 30,
                                    height: 30
                                }}
                            ></div>

                            <div
                                style={{
                                    backgroundColor: lighten(c, {
                                        percent: 20
                                    }),
                                    width: 30,
                                    height: 30
                                }}
                            ></div>
                        </div>
                    );
                })}
            </div>

            <p style={{ margin: 20, fontWeight: 600 }}>
                [gray] rgba to rgb by canvas
            </p>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    flexWrap: 'wrap'
                }}
            >
                {rgb_colors.map((c) => {
                    const color = c.replace('0.9', '0.9');
                    const gray = fomatFloatNumber(
                        getGrayLevel(
                            toRgb(color, {
                                format: RGBFormatType.Object
                            }) as RGB
                        ),
                        2
                    );
                    const { red, green, blue, alpha } = _toRgba(c, {
                        backgroundColor: '#ffffff',
                        format: RGBFormatType.Object
                    });

                    return (
                        <div
                            key={color}
                            style={{
                                marginLeft: 20,
                                marginBottom: 20,
                                display: 'flex',
                                justifyContent: 'flex-start',
                                flexWrap: 'wrap'
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: color,
                                    width: 30,
                                    height: 30
                                }}
                            ></div>
                            <div
                                style={{
                                    backgroundColor: `rgb(${red}, ${green}, ${blue})`,
                                    width: 30,
                                    height: 30
                                }}
                            ></div>
                        </div>
                    );
                })}
            </div>

            <p style={{ margin: 20, fontWeight: 600 }}>[gray] rgba to rgb</p>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    flexWrap: 'wrap'
                }}
            >
                {rgb_colors.map((c) => {
                    const color = c.replace('0.9', '0.9');
                    const gray = fomatFloatNumber(
                        getGrayLevel(
                            toRgb(color, {
                                format: RGBFormatType.Object
                            }) as RGB
                        ),
                        2
                    );

                    return (
                        <div
                            key={color}
                            style={{
                                marginLeft: 20,
                                marginBottom: 20,
                                display: 'flex',
                                justifyContent: 'flex-start',
                                flexWrap: 'wrap'
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: color,
                                    width: 30,
                                    height: 30
                                }}
                            ></div>
                            <div
                                style={{
                                    backgroundColor: toRgb(color) as string,
                                    width: 30,
                                    height: 30
                                }}
                            >
                                <span
                                    style={{
                                        color: gray > 0.5 ? 'black' : 'white',
                                        fontSize: 12,
                                        fontWeight: 'bold'
                                    }}
                                >
                                    文字
                                </span>
                                <pre style={{ fontSize: 12, marginTop: 5 }}>
                                    {gray}
                                </pre>
                            </div>
                        </div>
                    );
                })}
            </div>

            <p style={{ margin: 20, fontWeight: 600 }}>
                [gray] rgba to luminance
            </p>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    flexWrap: 'wrap'
                }}
            >
                {rgb_colors.map((c) => {
                    const color = c.replace('0.9', '1');
                    const gray = fomatFloatNumber(
                        getLuminance(
                            toRgb(color, {
                                format: RGBFormatType.Object
                            }) as RGB
                        ),
                        2
                    );
                    return (
                        <div
                            key={color}
                            style={{
                                marginLeft: 20,
                                marginBottom: 20,
                                display: 'flex',
                                justifyContent: 'flex-start',
                                flexWrap: 'wrap'
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: color,
                                    width: 30,
                                    height: 30
                                }}
                            ></div>
                            <div
                                style={{
                                    backgroundColor: toRgb(color) as string,
                                    width: 30,
                                    height: 30
                                }}
                            >
                                <span
                                    style={{
                                        color: gray > 0.45 ? 'black' : 'white',
                                        fontSize: 12,
                                        fontWeight: 'bold'
                                    }}
                                >
                                    文字
                                </span>
                                <pre style={{ fontSize: 12, marginTop: 5 }}>
                                    {gray}
                                </pre>
                            </div>
                        </div>
                    );
                })}
            </div>

            <p style={{ margin: 20, fontWeight: 600 }}>toHsl</p>
            <div>
                {colors.map((c) => {
                    return (
                        <div
                            key={c}
                            style={{
                                marginLeft: 20,
                                marginBottom: 20,
                                display: 'flex',
                                justifyContent: 'flex-start',
                                flexWrap: 'wrap'
                            }}
                        >
                            <div style={{ display: 'flex' }}>
                                <div
                                    style={{
                                        backgroundColor: c,
                                        width: 30,
                                        height: 30
                                    }}
                                ></div>
                                <div
                                    style={{
                                        backgroundColor: toHsl(c) as string,
                                        width: 30,
                                        height: 30
                                    }}
                                ></div>
                            </div>

                            <pre
                                style={{
                                    fontSize: 12,
                                    lineHeight: '30px',
                                    marginLeft: 10
                                }}
                            >
                                {toHsl(c)}
                            </pre>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Darken;
