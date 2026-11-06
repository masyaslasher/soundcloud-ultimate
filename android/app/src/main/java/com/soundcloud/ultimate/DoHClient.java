package com.soundcloud.ultimate;

import java.net.InetAddress;
import java.net.UnknownHostException;
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
                .connectTimeout(8, TimeUnit.SECONDS)
                .readTimeout(10, TimeUnit.SECONDS)
                .build();

        DnsOverHttps cloudflareDoH = null;
        try {
            cloudflareDoH = new DnsOverHttps.Builder()
                    .client(bootstrapClient)
                    .url(HttpUrl.get("https://1.1.1.1/dns-query"))
                    .bootstrapDnsHosts(
                            InetAddress.getByAddress("1.1.1.1", new byte[]{1, 1, 1, 1}),
                            InetAddress.getByAddress("1.0.0.1", new byte[]{1, 0, 0, 1})
                    )
                    .includeIPv6(false)
                    .build();
        } catch (UnknownHostException ignored) {}

        DnsOverHttps googleDoH = null;
        try {
            googleDoH = new DnsOverHttps.Builder()
                    .client(bootstrapClient)
                    .url(HttpUrl.get("https://dns.google/dns-query"))
                    .bootstrapDnsHosts(
                            InetAddress.getByAddress("dns.google", new byte[]{8, 8, 8, 8}),
                            InetAddress.getByAddress("dns.google", new byte[]{8, 8, 4, 4})
                    )
                    .includeIPv6(false)
                    .build();
        } catch (UnknownHostException ignored) {}

        final DnsOverHttps primaryDns = cloudflareDoH;
        final DnsOverHttps secondaryDns = googleDoH;

        Dns resilientDns = hostname -> {
            if (primaryDns != null) {
                try {
                    List<InetAddress> result = primaryDns.lookup(hostname);
                    if (!result.isEmpty()) return result;
                } catch (Exception ignored) {}
            }
            if (secondaryDns != null) {
                try {
                    List<InetAddress> result = secondaryDns.lookup(hostname);
                    if (!result.isEmpty()) return result;
                } catch (Exception ignored) {}
            }
            return Dns.SYSTEM.lookup(hostname);
        };

        client = new OkHttpClient.Builder()
                .dns(resilientDns)
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(20, TimeUnit.SECONDS)
                .followRedirects(true)
                .followSslRedirects(true)
                .build();

        return client;
    }
}
