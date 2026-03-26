import { cookiesResponseAction } from "../actions";

export default function cookiesConsentBanner() {
  return (
    <div className="">
      <section className="">
        <h1 className="">Cookies banner</h1>
        <p className="">...</p>
        <button onClick={() => cookiesResponseAction(true)} className="">
          Accepter les cookies
        </button>
        <button onClick={() => cookiesResponseAction(false)} className="">
          Refuser
        </button>
      </section>
    </div>
  );
}
