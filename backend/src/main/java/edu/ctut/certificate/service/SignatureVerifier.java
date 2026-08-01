package edu.ctut.certificate.service;

import edu.ctut.certificate.exception.WalletSignatureException;
import org.springframework.stereotype.Component;
import org.web3j.crypto.Keys;
import org.web3j.crypto.Sign;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

// Xac minh chu ky MetaMask tao ra bang personal_sign (eth_sign voi tien to "\x19Ethereum Signed Message:\n").
@Component
public class SignatureVerifier {

    public String recoverAddress(String message, String signatureHex) {
        try {
            byte[] messageBytes = message.getBytes(StandardCharsets.UTF_8);
            byte[] signatureBytes = Numeric.hexStringToByteArray(signatureHex);

            if (signatureBytes.length != 65) {
                throw new WalletSignatureException("Do dai chu ky khong hop le");
            }

            byte v = signatureBytes[64];
            if (v < 27) v += 27;
            byte[] r = Arrays.copyOfRange(signatureBytes, 0, 32);
            byte[] s = Arrays.copyOfRange(signatureBytes, 32, 64);
            Sign.SignatureData signatureData = new Sign.SignatureData(v, r, s);

            BigInteger publicKey = Sign.signedPrefixedMessageToKey(messageBytes, signatureData);
            return "0x" + Keys.getAddress(publicKey);
        } catch (WalletSignatureException e) {
            throw e;
        } catch (Exception e) {
            throw new WalletSignatureException("Khong the xac minh chu ky: " + e.getMessage());
        }
    }

    public boolean matches(String message, String signatureHex, String expectedAddress) {
        String recovered = recoverAddress(message, signatureHex);
        return recovered.equalsIgnoreCase(expectedAddress);
    }
}
