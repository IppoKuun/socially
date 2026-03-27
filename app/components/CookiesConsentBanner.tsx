import { cookiesResponseAction } from "../actions";

type Props = {
  utm_medium?: string;
  utm_campaign?: string;
  utm_source?: string;
  refere?: string | null;
  language?: string | null;
};
export default function CookiesConsentBanner({
  utm_medium,
  utm_campaign,
  utm_source,
  refere,
  language,
}: Props) {
  const payload = {
    utm_source,
    utm_medium,
    utm_campaign,
    refere,
    language,
  };
  return (
    <div className="">
      <section className="">
        <h1 className="">Cookies banner</h1>
        <p className="">...</p>
        <input type="submit"></input>
        <button
          onClick={() => cookiesResponseAction(true, payload)}
          className=""
        >
          Accepter les cookies
        </button>
        <button onClick={() => cookiesResponseAction(false)} className="">
          Refuser
        </button>
      </section>
    </div>
  );
}
