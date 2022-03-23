import LinksHandler from "../dist/links";

const aaa = new LinksHandler((token: string) => {
    console.log('aaa', token);
});

const bbb = new LinksHandler((token: string) => {
    console.log('bbb', token);
});

const ccc = new LinksHandler((token: string) => {
    console.log('ccc', token);
});

aaa.next(bbb).next(ccc);
aaa.run('token');
