import Form from "./forms/Form.tsx";
import Header from "./header/Header.tsx";
import Footer from "./footer/Footer.tsx";
import BackgroundMotifs from "./background/BackgroundMotifs.tsx";

export default function RootLayout() {
    return (
        <div className="bahis-app">
            <BackgroundMotifs/>
            <Header/>
            <main className="bahis-main">
                <Form/>
            </main>
            <Footer/>
        </div>
    )
}
