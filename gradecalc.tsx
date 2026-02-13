import { createRoot } from 'react-dom/client';

function Hello(): JSX.Element {
    return (
        <h1>Hello World!</h1>
    );
}

const rootElement = document.getElementById('root');
if (rootElement) {
    createRoot(rootElement).render(<Hello />);
}
