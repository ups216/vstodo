import * as vscode from "vscode";
import { apiBaseUrl } from "./constants";
import * as polka from "polka";
import { TokenManager } from "./TokenManager";

export const authenticate = (fn:()=>void) => {
  const app = polka();
  app.get(`/auth/:token`, async (req, res) => {
    const { token } = req.params;
    if (!token) {
      res.end("<h1>something went wrong</h1>");
      return;
    }
    await TokenManager.setToken(token);
    vscode.window.showInformationMessage(
      "Token value is " + TokenManager.getToken()
    );
    fn();

    res.end("<h1>auth was successful, close this windows now</h1>");

    app.server?.removeAllListeners();
    (app as any).server?.close;
  });

  app.listen(54321, (err: Error) => {
    if (err) {
      vscode.window.showErrorMessage(err.message);
    } else {
      vscode.commands.executeCommand(
        "vscode.open",
        vscode.Uri.parse(`${apiBaseUrl}/auth/github/`)
      );
    }
  });
};
