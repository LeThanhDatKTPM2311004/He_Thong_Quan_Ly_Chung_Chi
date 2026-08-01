package edu.ctut.certificate.service;

import org.junit.jupiter.api.Test;
import org.web3j.crypto.ECKeyPair;
import org.web3j.crypto.Keys;
import org.web3j.crypto.Sign;
import org.web3j.utils.Numeric;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;

import static org.junit.jupiter.api.Assertions.*;

class SignatureVerifierTest {

    private final SignatureVerifier verifier = new SignatureVerifier();

    private String signPersonalMessage(String message, ECKeyPair keyPair) {
        Sign.SignatureData sig = Sign.signMessage(message.getBytes(StandardCharsets.UTF_8), keyPair);
        byte[] retval = new byte[65];
        System.arraycopy(sig.getR(), 0, retval, 0, 32);
        System.arraycopy(sig.getS(), 0, retval, 32, 32);
        System.arraycopy(sig.getV(), 0, retval, 64, 1);
        return Numeric.toHexString(retval);
    }

    @Test
    void recoversCorrectAddressForValidSignature() throws Exception {
        ECKeyPair keyPair = Keys.createEcKeyPair(new SecureRandom());
        String address = "0x" + Keys.getAddress(keyPair.getPublicKey());
        String message = "CTUT dang nhap - nonce=abc123";

        String signature = signPersonalMessage(message, keyPair);

        assertTrue(verifier.matches(message, signature, address));
    }

    @Test
    void rejectsSignatureWhenMessageTampered() throws Exception {
        ECKeyPair keyPair = Keys.createEcKeyPair(new SecureRandom());
        String address = "0x" + Keys.getAddress(keyPair.getPublicKey());
        String message = "CTUT dang nhap - nonce=abc123";
        String signature = signPersonalMessage(message, keyPair);

        assertFalse(verifier.matches("CTUT dang nhap - nonce=DA-BI-SUA", signature, address));
    }

    @Test
    void rejectsSignatureFromDifferentWallet() throws Exception {
        ECKeyPair signerKey = Keys.createEcKeyPair(new SecureRandom());
        ECKeyPair otherKey = Keys.createEcKeyPair(new SecureRandom());
        String otherAddress = "0x" + Keys.getAddress(otherKey.getPublicKey());
        String message = "CTUT dang nhap - nonce=xyz";
        String signature = signPersonalMessage(message, signerKey);

        assertFalse(verifier.matches(message, signature, otherAddress));
    }
}
