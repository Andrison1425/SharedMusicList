package io.ionic.starter;

import com.getcapacitor.BridgeActivity;
import com.ingageco.capacitormusiccontrols.CapacitorMusicControls;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

      registerPlugin(CapacitorMusicControls.class);
    }
 }
