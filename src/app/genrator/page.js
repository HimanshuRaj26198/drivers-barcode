"use client";
import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import JsBarcode from "jsbarcode";
import Quagga from "quagga";

const GenratorPage = () => {
    const { register, handleSubmit } = useForm();
    const [barcodeData, setBarcodeData] = useState(""); // Store the scanned barcode data
    const scannerRef = useRef(null); // Reference to scanner div
    const barcodeRef = useRef(null); // Reference to barcode SVG element

    const onSubmit = (data) => {
        const jsonData = JSON.stringify(data);
        setBarcodeData(jsonData);

        // Generate barcode with JsBarcode after setting the data
        if (barcodeRef.current) {
            JsBarcode(barcodeRef.current, jsonData, {
                format: "CODE128",
                width: 0.5,
                height: 100,
            });
        }
    };

    const startScanner = () => {
        if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
            console.error("Camera access is not supported in this environment.");
            return;
        }

        if (!scannerRef.current) {
            console.error("Scanner container not found!");
            return;
        }

        Quagga.init(
            {
                inputStream: {
                    type: "LiveStream",
                    target: scannerRef.current, // Use the ref for target
                    constraints: { facingMode: "environment" },
                },
                decoder: { readers: ["code_128_reader"] },
            },
            (err) => {
                if (err) {
                    console.error("Quagga initialization failed:", err);
                    return;
                }
                Quagga.start();

                Quagga.onDetected((result) => {
                    if (result?.codeResult?.code) {
                        // Update the barcodeData state with the scanned data
                        setBarcodeData(result.codeResult.code);

                        // Stop the scanner after detection
                        Quagga.stop();
                    } else {
                        console.warn("No barcode detected.");
                    }
                });
            }
        );
    };

    return (
        <div>
            <h2>Driver License Form</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input {...register("dlNumber")} placeholder="DL Number" required />
                <input {...register("lastName")} placeholder="Last Name" required />
                <input {...register("firstName")} placeholder="First Name" required />
                <input {...register("address")} placeholder="Address" required />
                <input {...register("city")} placeholder="City" required />
                <input {...register("zipCode")} placeholder="Zip Code" required />
                <input {...register("birthDate")} placeholder="Birth Date" required />
                <button type="submit">Create</button>
            </form>

            <div className="barcode_container" style={{ width: "500px", height: "auto" }}>
                {/* Barcode SVG rendered using JsBarcode */}
                <svg ref={barcodeRef}></svg>
            </div>

            {/* Scanner Container (Now using useRef) */}
            <div ref={scannerRef} style={{ width: "100%", height: "300px", background: "#f0f0f0" }}>
                <p>Scanning area...</p>
            </div>

            <button onClick={startScanner}>Scan Barcode</button>

            {/* Display Scanned Data */}
            {barcodeData && (
                <div>
                    <h3>Scanned Barcode Data:</h3>
                    <p>{barcodeData}</p>
                </div>
            )}
        </div>
    );
};

export default GenratorPage;
