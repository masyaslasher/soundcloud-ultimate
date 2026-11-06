package com.soundcloud.ultimate;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;

import okhttp3.Dns;
import okhttp3.HttpUrl;
import okhttp3.OkHttpClient;
import okhttp3.dnsoverhttps.DnsOverHttps;

public class DoHClient {
    private static OkHttpClient client;

    public static synchronized OkHttpClient getClient() {
        if (client != null) {
            return client;
        }

        OkHttpClient bootstrapClient = new OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.SECONDS)
                .readTimeout(15, TimeUnit.SECONDS)
                .build();

        DnsOverHttps dnsOverHttps = null;
        try {
            dnsOverHttps = new DnsOverHttps.Builder()
                    .client(bootstrapClient)
                    .url(HttpUrl.get("https://1.1.1.1/dns-query"))
                    .bootstrapDnsHosts(
                            InetAddress.getByName("1.1.1.1"),
                            InetAddress.getByName("1.0.0.1"),
                            InetAddress.getByName("8.8.8.8")
                    )
                    .includeIPv6(false)
                    .build();
        } catch (UnknownHostException e) {
            // Fallback to standard DNS if bootstrap host resolution fails
            dnsOverHttps = null;
        }

        OkHttpClient.Builder builder = new OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(20, TimeUnit.SECONDS)
                .followRedirects(true);

        if (dnsOverHttps != null) {
            builder.dns(dnsOverHttps);
        }

        client = builder.build();
        return client;
    }
}
