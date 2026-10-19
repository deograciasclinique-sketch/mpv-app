package org.lifewordmission.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AppSharePlugin.class); // partage de l'APK par WhatsApp, version, liens externes
        super.onCreate(savedInstanceState);
    }
}
