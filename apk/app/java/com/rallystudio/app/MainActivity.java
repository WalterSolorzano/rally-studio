package com.rallystudio.app;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.text.InputType;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

/**
 * Una sola vista: el tablero de Rally Studio dentro de un WebView.
 *
 * La dirección vive en `res/values/config.xml` (`app_url`). Si ese valor es
 * ADDR, la app pide la dirección una vez y la guarda en el teléfono.
 */
public class MainActivity extends Activity {

    private static final String PREFS = "rally";
    private static final String CLAVE_URL = "app_url";
    private static final String MARCA = "ADDR";

    private FrameLayout raiz;
    private WebView vista;
    private String base;

    @Override
    protected void onCreate(Bundle estado) {
        super.onCreate(estado);
        raiz = new FrameLayout(this);
        setContentView(raiz);

        base = direccionGuardada();
        if (base.isEmpty()) {
            pedirDireccion(getString(R.string.app_url));
        } else {
            abrirTablero(base);
        }
    }

    // ------------------------------------------------------------------ url

    private String direccionGuardada() {
        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        String valor = prefs.getString(CLAVE_URL, "");
        if (valor == null || valor.isEmpty()) {
            String fija = getString(R.string.app_url).trim();
            if (!fija.isEmpty() && !MARCA.equals(fija)) return normalizar(fija);
            return "";
        }
        return normalizar(valor);
    }

    private String normalizar(String direccion) {
        String limpia = direccion.trim();
        if (limpia.isEmpty()) return "";
        if (!limpia.startsWith("http://") && !limpia.startsWith("https://")) {
            limpia = "http://" + limpia;
        }
        if (!limpia.endsWith("/")) limpia = limpia + "/";
        return limpia;
    }

    private void pedirDireccion(String sugerencia) {
        LinearLayout caja = new LinearLayout(this);
        caja.setOrientation(LinearLayout.VERTICAL);
        caja.setBackgroundColor(Color.WHITE);
        caja.setPadding(48, 96, 48, 48);
        caja.setGravity(Gravity.TOP);

        TextView titulo = new TextView(this);
        titulo.setText("Dirección del tablero");
        titulo.setTextColor(Color.parseColor("#0D1B35"));
        titulo.setTextSize(20);
        caja.addView(titulo);

        TextView nota = new TextView(this);
        nota.setText("Ejemplo: 192.168.1.50:8000");
        nota.setTextColor(Color.parseColor("#5C7193"));
        nota.setTextSize(13);
        nota.setPadding(0, 12, 0, 0);
        caja.addView(nota);

        final EditText campo = new EditText(this);
        campo.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_URI);
        campo.setTextColor(Color.parseColor("#0D1B35"));
        campo.setHint("http://servidor:8000/");
        campo.setSingleLine(true);
        campo.setPadding(0, 28, 0, 28);
        if (sugerencia != null && !MARCA.equals(sugerencia)) campo.setText(sugerencia);
        caja.addView(campo);

        Button boton = new Button(this);
        boton.setText("Abrir");
        boton.setAllCaps(false);
        boton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String destino = normalizar(campo.getText().toString());
                if (destino.isEmpty()) {
                    campo.setError("Escribe la dirección del servidor");
                    return;
                }
                getSharedPreferences(PREFS, MODE_PRIVATE)
                        .edit().putString(CLAVE_URL, destino).apply();
                base = destino;
                abrirTablero(destino);
            }
        });
        caja.addView(boton, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        raiz.removeAllViews();
        raiz.addView(caja, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
    }

    // -------------------------------------------------------------- tablero

    private void abrirTablero(String direccion) {
        if (vista == null) {
            vista = new WebView(this);
            vista.setBackgroundColor(Color.WHITE);
            configurar(vista);
            raiz.removeAllViews();
            raiz.addView(vista, new FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        }
        vista.loadUrl(direccion);
    }

    private void configurar(WebView w) {
        WebSettings ajustes = w.getSettings();
        ajustes.setJavaScriptEnabled(true);
        ajustes.setDomStorageEnabled(true);
        ajustes.setDatabaseEnabled(true);
        ajustes.setLoadWithOverviewMode(true);
        ajustes.setUseWideViewPort(true);
        ajustes.setSupportZoom(false);
        ajustes.setBuiltInZoomControls(false);
        ajustes.setMediaPlaybackRequiresUserGesture(false);
        ajustes.setAllowFileAccess(false);
        ajustes.setAllowContentAccess(false);
        ajustes.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        ajustes.setCacheMode(WebSettings.LOAD_DEFAULT);
        ajustes.setUserAgentString(ajustes.getUserAgentString() + " RallyApp/1.0");

        w.setWebChromeClient(new WebChromeClient());
        w.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest pedido) {
                Uri destino = pedido.getUrl();
                // Fuera del servidor del rally: se abre en el navegador.
                if (!mismoServidor(destino)) {
                    Intent intento = new Intent(Intent.ACTION_VIEW, destino);
                    try {
                        startActivity(intento);
                    } catch (ActivityNotFoundException ignorado) {
                        return false;
                    }
                    return true;
                }
                return false;
            }

            @Override
            public void onReceivedError(WebView v, WebResourceRequest pedido, WebResourceError error) {
                if (pedido == null || !pedido.isForMainFrame()) return;
                avisarSinServidor();
            }
        });
    }

    private boolean mismoServidor(Uri destino) {
        if (destino == null) return true;
        String esquema = destino.getScheme();
        if (esquema != null && !"http".equals(esquema) && !"https".equals(esquema)) return false;
        Uri propio = Uri.parse(base);
        return propio.getHost() != null && propio.getHost().equals(destino.getHost());
    }

    private void avisarSinServidor() {
        LinearLayout caja = new LinearLayout(this);
        caja.setOrientation(LinearLayout.VERTICAL);
        caja.setBackgroundColor(Color.WHITE);
        caja.setPadding(48, 96, 48, 48);

        TextView titulo = new TextView(this);
        titulo.setText("Sin conexión con el tablero");
        titulo.setTextColor(Color.parseColor("#0D1B35"));
        titulo.setTextSize(20);
        caja.addView(titulo);

        TextView nota = new TextView(this);
        nota.setText(base + "\nRevisa que el servidor esté encendido y que el teléfono esté en la misma red.");
        nota.setTextColor(Color.parseColor("#5C7193"));
        nota.setTextSize(13);
        nota.setPadding(0, 12, 0, 28);
        caja.addView(nota);

        Button reintentar = new Button(this);
        reintentar.setText("Reintentar");
        reintentar.setAllCaps(false);
        reintentar.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                raiz.removeAllViews();
                raiz.addView(vista);
                vista.loadUrl(base);
            }
        });
        caja.addView(reintentar);

        Button cambiar = new Button(this);
        cambiar.setText("Cambiar dirección");
        cambiar.setAllCaps(false);
        cambiar.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                pedirDireccion(base);
            }
        });
        caja.addView(cambiar);

        raiz.removeAllViews();
        raiz.addView(caja, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
    }

    // -------------------------------------------------------------- sistema

    @Override
    public boolean onKeyDown(int codigo, KeyEvent evento) {
        if (codigo == KeyEvent.KEYCODE_BACK && vista != null && vista.canGoBack()) {
            vista.goBack();
            return true;
        }
        return super.onKeyDown(codigo, evento);
    }

    @Override
    protected void onSaveInstanceState(Bundle salida) {
        super.onSaveInstanceState(salida);
        if (vista != null) vista.saveState(salida);
    }

    @Override
    protected void onDestroy() {
        if (vista != null) {
            raiz.removeView(vista);
            vista.destroy();
            vista = null;
        }
        super.onDestroy();
    }
}
