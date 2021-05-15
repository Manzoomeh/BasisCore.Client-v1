import BasisCore from "./context/BasisCore";
import "./extentions/StringExtentions";
import "./extentions/ElementExtentions";

console.log(
  `%cWelcome To BasisCore Ecosystem%c
follow us on https://BasisCore.com/
version:1.6.1`,
  " background: yellow;color: #0078C1; font-size: 2rem; font-family: Arial; font-weight: bolder",
  "color: #0078C1; font-size: 1rem; font-family: Arial;"
);

(window as any).$bc = function (): BasisCore {
  if (BasisCore.Current === null) {
    BasisCore.CreateAndInitialize();
  }
  (window as any).$bc = () => BasisCore.Current;
  return BasisCore.Current;
};

window.onload = async () => {
  if ((window as any).$bc().Context.HostSetting.AutoRender ?? true) {
    await (window as any).$bc().Context.RenderAsync();
  }
};
