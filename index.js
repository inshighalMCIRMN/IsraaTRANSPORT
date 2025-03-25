<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestion des Voitures</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            background: linear-gradient(135deg, #e0eafc, #cfdef3);
            margin: 0;
            padding: 20px;
            direction: ltr;
            color: #333;
        }
        h2 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 20px;
            font-size: 2em;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        form {
            background: #fff;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin: 20px auto;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: space-between;
            align-items: center;
            width: 95%;
            max-width: none;
        }
        form:hover {
            transform: translateY(-5px);
            transition: transform 0.3s;
        }
        input, button, select {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 12px;
            text-align: left;
            box-sizing: border-box;
            transition: border-color 0.3s;
            flex: 1;
            min-width: 120px;
        }
        input:focus, select:focus {
            border-color: #3498db;
            outline: none;
        }
        button {
            background: #3498db;
            color: white;
            cursor: pointer;
            border: none;
            font-weight: bold;
            transition: background 0.3s, transform 0.2s;
            padding: 4px 8px;
            font-size: 10px;
            width: 80px;
        }
        button:hover {
            background: #2980b9;
            transform: scale(1.05);
        }
        button.update { background: #e67e22; }
        button.update:hover { background: #d35400; }
        button.edit { background: #8e44ad; }
        button.edit:hover { background: #732d91; }
        button.check { background: #27ae60; }
        button.check:hover { background: #219653; }
        button.delete { background: #e74c3c; }
        button.delete:hover { background: #c0392b; }
        .buttons, .filter-box {
            background: #fff;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            max-width: 600px;
            margin: 20px auto;
            text-align: center;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
        }
        .filter-box select, .filter-box input {
            width: 200px;
        }
        table {
            width: 95%;
            margin: 20px auto;
            border-collapse: collapse;
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        th, td {
            padding: 4px;
            border: 1px solid #eee;
            text-align: center;
            font-size: 11px;
            vertical-align: middle;
        }
        th {
            background: #34495e;
            color: white;
            font-weight: bold;
        }
        tr:nth-child(even) { background: #f9f9f9; }
        tr:hover { background: #f1f1f1; }
        .optional { color: #7f8c8d; font-size: 0.9em; }
        .log-section {
            max-width: 800px;
            margin: 20px auto;
            background: #fff;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .log-section h3 { color: #2c3e50; margin-bottom: 15px; }
        .log-section ul { list-style: none; padding: 0; }
        .log-section li { padding: 10px; border-bottom: 1px solid #eee; }
        .action-cell {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
        }
    </style>
</head>
<body>

    <h2>Gestion des Voitures</h2>

    <form id="carForm">
        <input type="text" id="plate" placeholder="Numéro d'immatriculation" required oninput="autoFillModelAndDriver()">
        <input type="text" id="model" placeholder="Nom de la voiture" required>
        <input type="number" id="km" placeholder="Kilométrage" required min="0">
        <input type="text" id="renter" placeholder="Locataire" required>
        <input type="text" id="wilaya" placeholder="Wilaya" required>
        <input type="text" id="driver" placeholder="Conducteur (facultatif)" class="optional">
        <input type="date" id="insuranceStart" placeholder="Début de l'assurance" required>
        <input type="date" id="insuranceEnd" placeholder="Fin de l'assurance" required>
        <button type="submit">Ajouter une Voiture</button>
    </form>

    <div class="filter-box">
        <select id="filterType" onchange="updateFilterInput()">
            <option value="plate">Numéro d'immatriculation</option>
            <option value="renter">Locataire</option>
            <option value="maintenance">Alerte de maintenance</option>
            <option value="insurance">Proximité de l'assurance</option>
        </select>
        <input type="text" id="filterValue" placeholder="Entrez une valeur de recherche" oninput="updateFilterInput()">
        <div id="maintenanceOptions" style="display: none;">
            <select id="maintenanceType" onchange="filterCars()">
                <option value="oil">Maintenance de l'huile</option>
                <option value="gear">Maintenance de la Chaine de distrubition</option>
            </select>
        </div>
        <button onclick="clearFilter()">🗑️ Réinitialiser le filtre</button>
    </div>

    <h2>Liste des Voitures</h2>
    <table>
        <thead>
            <tr>
                <th>Numéro d'immatriculation</th>
                <th>Nom de la voiture</th>
                <th>Locataire</th>
                <th>Conducteur</th>
                <th>Wilaya</th>
                <th>Kilométrage</th>
                <th>Carte de carburant</th>
                <th>Total carburant</th>
                <th>Alerte carburant</th>
                <th>Alerte maintenance huile</th>
                <th>Alerte maintenance boîte</th>
                <th>Période d'assurance</th>
                <th>Alerte assurance</th>
                <th>Gestion</th>
            </tr>
        </thead>
        <tbody id="carList"></tbody>
    </table>

    <div class="buttons">
        <button onclick="exportToExcel()">📊 Exporter en Excel</button>
        <button onclick="exportOperationsLog()">📜 Exporter le journal des opérations</button>
        <button onclick="clearAllData()" class="delete">🗑️ Supprimer toutes les données</button>
    </div>

    <div class="log-section">
        <h3>Journal des Opérations (Carburant & Kilométrage)</h3>
        <ul id="operationLog"></ul>
    </div>

    <script>
        let debounceTimeout;
        let isFilterActive = false;

        function clearFilter() {
            console.log("Début de la réinitialisation du filtre");
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
                debounceTimeout = null;
            }
            const filterType = document.getElementById("filterType");
            const filterValue = document.getElementById("filterValue");
            const maintenanceOptions = document.getElementById("maintenanceOptions");
            filterType.value = "plate";
            filterValue.value = "";
            filterValue.style.display = "inline-block";
            maintenanceOptions.style.display = "none";
            isFilterActive = false;
            console.log("isFilterActive défini à false");
            loadAllCars(); // إعادة تحميل جميع البيانات
            console.log("Filtre réinitialisé, tableau rechargé avec toutes les voitures");
        }

        function filterCars() {
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }
            debounceTimeout = setTimeout(() => {
                const filterType = document.getElementById("filterType").value;
                const filterValueInput = document.getElementById("filterValue");
                const filterValue = filterValueInput.value.toLowerCase().trim();
                const maintenanceType = document.getElementById("maintenanceType")?.value;

                console.log("Filtrage des voitures - type:", filterType, "valeur:", filterValue, "type de maintenance:", maintenanceType);

                // قراءة البيانات الأصلية من localStorage
                let cars = JSON.parse(localStorage.getItem("cars")) || [];
                if (!Array.isArray(cars)) {
                    console.error("Les données des voitures ne sont pas valides, réinitialisation.");
                    cars = [];
                    localStorage.setItem("cars", JSON.stringify(cars));
                }

                // تصفية البيانات دون التأثير على localStorage
                let filteredCars = [...cars]; // نسخة من البيانات الأصلية
                if (filterValue && (filterType === "plate" || filterType === "renter")) {
                    filteredCars = cars.filter(car => {
                        const valueToCheck = filterType === "plate" ? car.plate.toLowerCase() : car.renter.toLowerCase();
                        console.log("Vérification:", valueToCheck, "contient:", filterValue);
                        return valueToCheck.includes(filterValue);
                    });
                } else if (filterType === "maintenance" && maintenanceType) {
                    filteredCars = cars.filter(car => {
                        if (maintenanceType === "oil") {
                            return checkOilMaintenance(car.totalKm, car.oilReset) === "⚠️⚠️ Requis immédiatement";
                        } else if (maintenanceType === "gear") {
                            return checkGearMaintenance(car.totalKm, car.gearReset) === "⚠️⚠️ Requis immédiatement";
                        }
                        return false;
                    });
                } else if (filterType === "insurance") {
                    const today = new Date();
                    filteredCars = cars.filter(car => {
                        const end = new Date(car.insuranceEnd);
                        const diffTime = end - today;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays <= 3 && diffDays >= -30;
                    });
                }

                console.log("Voitures filtrées:", filteredCars);
                displayCars(filteredCars); // عرض البيانات المفلترة فقط
            }, 300);
        }

        function updateFilterInput() {
            const filterType = document.getElementById("filterType").value;
            const filterValueInput = document.getElementById("filterValue");
            const maintenanceOptions = document.getElementById("maintenanceOptions");

            console.log("Mise à jour de l'entrée de filtre - type:", filterType);

            if (filterType === "plate" || filterType === "renter") {
                filterValueInput.style.display = "inline-block";
                maintenanceOptions.style.display = "none";
                filterValueInput.placeholder = filterType === "plate" ? "Entrez le numéro d'immatriculation" : "Entrez le nom du locataire";
            } else {
                filterValueInput.style.display = "none";
                if (filterType === "maintenance") {
                    maintenanceOptions.style.display = "inline-block";
                } else {
                    maintenanceOptions.style.display = "none";
                }
            }

            // تحديث حالة الفلتر بناءً على القيمة
            isFilterActive = filterValueInput.value.trim().length > 0 || (filterType === "maintenance" && maintenanceOptions.style.display !== "none");
            console.log("isFilterActive défini à:", isFilterActive);

            // استدعاء الدالة المناسبة بناءً على حالة الفلتر
            if (isFilterActive) {
                filterCars();
            } else {
                loadAllCars();
            }
        }

        function checkPlateForAutoFill(plate) {
            let cars = JSON.parse(localStorage.getItem("cars")) || [];
            console.log("Vérification de la plaque pour l'auto-remplissage:", plate);
            const existingCar = cars.find(car => car.plate.toLowerCase() === plate.toLowerCase());
            if (!existingCar) {
                console.warn("Aucune voiture trouvée pour la plaque:", plate);
            } else {
                console.log("Voiture existante trouvée pour l'auto-remplissage:", existingCar);
            }
            return existingCar;
        }

        function autoFillModelAndDriver() {
            const plate = document.getElementById("plate").value.trim();
            const modelInput = document.getElementById("model");
            const driverInput = document.getElementById("driver");

            if (!plate) {
                console.log("Champ de plaque vide, réinitialisation des champs.");
                modelInput.value = "";
                driverInput.value = "";
                return;
            }

            const existingCar = checkPlateForAutoFill(plate);

            if (existingCar) {
                console.log("Auto-remplissage du modèle et du conducteur pour la plaque:", plate);
                modelInput.value = existingCar.model || "";
                driverInput.value = existingCar.driver || "";
            } else {
                console.log("Aucune voiture existante trouvée pour la plaque:", plate);
                modelInput.value = "";
                driverInput.value = "";
            }
        }

        function checkOilMaintenance(totalKm, oilReset) {
            if (typeof totalKm !== 'number') return "❌ Erreur";
            if (oilReset) return "✅ Maintenance effectuée";
            return totalKm >= 9000 ? "⚠️⚠️ Requis immédiatement" : "✅ En cours";
        }

        function checkGearMaintenance(totalKm, gearReset) {
            if (typeof totalKm !== 'number') return "❌ Erreur";
            if (gearReset) return "✅ Maintenance effectuée";
            return totalKm >= 90000 ? "⚠️⚠️ Requis immédiatement" : "✅ En cours";
        }

        function checkInsurance(endDate) {
            if (!endDate) return "❌ Erreur";
            const today = new Date();
            const end = new Date(endDate);
            if (isNaN(end.getTime())) return "❌ Erreur";
            const diffTime = end - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 3 && diffDays >= 0) return `⚠️ ${diffDays} jours`;
            if (diffDays < 0) return "❌ Expiré";
            return "✅ En cours";
        }

        function checkFuel(fuelRecords) {
            if (!fuelRecords || !Array.isArray(fuelRecords)) return "⏳ Non ajouté";
            const total = fuelRecords.reduce((sum, record) => {
                if (!record || typeof record.amount !== 'number') return sum;
                return sum + record.amount;
            }, 0);
            return total >= 12000 ? `⚠️ (${total} DZD)` : `✅ (${total} DZD)`;
        }

        function displayCars(cars) {
            const carListBody = document.getElementById("carList");
            console.log("Affichage des voitures:", cars);

            if (!carListBody) {
                console.error("Élément du corps du tableau non trouvé");
                return;
            }

            carListBody.innerHTML = "";
            console.log("Tableau vidé");

            if (!cars || !Array.isArray(cars) || cars.length === 0) {
                console.log("Aucune voiture à afficher");
                carListBody.innerHTML = "<tr><td colspan='14'>Aucune voiture à afficher</td></tr>";
                return;
            }

            cars.forEach((car, index) => {
                console.log(`Traitement de la voiture ${index}:`, car);

                if (!car.fuelRecords || !Array.isArray(car.fuelRecords)) {
                    console.warn(`Enregistrements de carburant invalides pour la voiture ${car.plate || "inconnue"}, réinitialisation à un tableau vide`);
                    car.fuelRecords = [];
                }

                if (!car.kmRecords || !Array.isArray(car.kmRecords)) {
                    console.warn(`Enregistrements de kilométrage invalides pour la voiture ${car.plate || "inconnue"}, réinitialisation à un tableau vide`);
                    car.kmRecords = [];
                }

                let totalKm = 0;
                if (typeof car.totalKm === 'number') {
                    totalKm = car.totalKm;
                } else if (car.kmRecords && Array.isArray(car.kmRecords)) {
                    totalKm = car.kmRecords.reduce((sum, km) => {
                        if (typeof km === "number") return sum + km;
                        if (km && typeof km.amount === "number") return sum + km.amount;
                        return sum;
                    }, 0);
                    console.log(`Kilométrage total calculé pour la voiture ${car.plate}:`, totalKm);
                } else {
                    console.warn(`Enregistrements de kilométrage invalides pour la voiture ${car.plate}, utilisation de totalKm:`, totalKm);
                }

                let oilAlert = checkOilMaintenance(totalKm, car.oilReset || false);
                let gearAlert = checkGearMaintenance(totalKm, car.gearReset || false);
                let insuranceAlert = checkInsurance(car.insuranceEnd);
                let fuelAlert = checkFuel(car.fuelRecords);

                let totalFuel = car.fuelRecords.reduce((sum, r) => sum + (r.amount || 0), 0);

                let row = document.createElement("tr");
                row.innerHTML = `
                    <td>${car.plate || "-"}</td>
                    <td>${car.model || "-"}</td>
                    <td>${car.renter || "-"}</td>
                    <td>${car.driver || "-"}</td>
                    <td>${car.wilaya || "-"}</td>
                    <td class="action-cell">
                        ${totalKm} km
                        <button class="update" onclick="updateKm(${index})">➕</button>
                    </td>
                    <td>${car.fuelCard || "Non défini"}</td>
                    <td class="action-cell">
                        ${totalFuel} DZD
                        <button class="update" onclick="addFuel(${index})">⛽</button>
                    </td>
                    <td>${fuelAlert}</td>
                    <td class="action-cell">
                        ${oilAlert}
                        <button class="check" onclick="checkMaintenance(${index})">🔧</button>
                    </td>
                    <td>${gearAlert}</td>
                    <td>${car.insuranceStart || "-"} à ${car.insuranceEnd || "-"}</td>
                    <td>${insuranceAlert}</td>
                    <td>
                        <button class="edit" onclick="editCar(${index})">✏️</button>
                        <button class="delete" onclick="deleteCar(${index})">🗑️</button>
                    </td>
                `;
                carListBody.appendChild(row);

                console.log(`Ligne ajoutée pour la voiture ${car.plate || "inconnue"} au tableau`);
            });

            // ملاحظة: لم نعد نحتفظ بـ localStorage هنا لأن هذه الدالة مخصصة للعرض فقط
        }

        function loadAllCars() {
            console.log("Chargement de toutes les voitures depuis localStorage");
            let cars = [];
            try {
                const storedCars = localStorage.getItem("cars");
                console.log("Données brutes depuis localStorage:", storedCars);
                cars = storedCars ? JSON.parse(storedCars) : [];
                if (!Array.isArray(cars)) {
                    console.warn("Les données des voitures ne sont pas un tableau, réinitialisation à un tableau vide");
                    cars = [];
                    localStorage.setItem("cars", JSON.stringify(cars));
                }
                console.log("Voitures chargées:", cars);
            } catch (error) {
                console.error("Erreur lors de l'analyse des voitures depuis localStorage:", error);
                cars = [];
                localStorage.setItem("cars", JSON.stringify(cars));
            }
            if (cars.length === 0) {
                console.warn("Aucune voiture trouvée dans localStorage");
            }
            displayCars(cars);
        }

        document.addEventListener("DOMContentLoaded", function () {
            const carForm = document.getElementById("carForm");
            const carList = document.getElementById("carList");
            const driverInput = document.getElementById("driver");
            const operationLog = document.getElementById("operationLog");

            console.log("Page chargée avec succès");

            const savedDriver = localStorage.getItem("lastDriver");
            if (savedDriver) {
                console.log("Restauration du dernier conducteur:", savedDriver);
                driverInput.value = savedDriver;
            }

            let logs = [];
            try {
                logs = JSON.parse(localStorage.getItem("operationLogs")) || [];
                console.log("Journaux d'opérations initiaux:", logs);
                logs = logs.filter(log => 
                    log.operation === "Augmentation du kilométrage" || 
                    log.operation === "Ajout de carburant" || 
                    log.operation === "Recharge de la carte"
                );
                localStorage.setItem("operationLogs", JSON.stringify(logs));
            } catch (error) {
                console.error("Erreur lors de l'analyse des journaux d'opérations depuis localStorage:", error);
                logs = [];
                localStorage.setItem("operationLogs", JSON.stringify(logs));
            }

            const fuelCards = [
                "Carte 1", "Carte 2", "Carte 3", "Carte 4", "Carte 5",
                "Carte 6", "Carte 7", "Carte 8", "Carte 9", "Carte 10"
            ];

            function logOperation(plate, date, operation, details) {
                const logEntry = { plate, date, operation, details };
                logs.push(logEntry);
                localStorage.setItem("operationLogs", JSON.stringify(logs));
                console.log("Opération enregistrée:", logEntry);
                updateLogDisplay();
            }

            function updateLogDisplay() {
                operationLog.innerHTML = "";
                logs.forEach(log => {
                    const li = document.createElement("li");
                    li.textContent = `${log.plate} - ${log.date}: ${log.operation} - ${log.details}`;
                    operationLog.appendChild(li);
                });
                console.log("Affichage du journal des opérations mis à jour");
            }

            carForm.addEventListener("submit", function (e) {
                e.preventDefault();
                console.log("Formulaire soumis");

                let plate = document.getElementById("plate").value;
                let model = document.getElementById("model").value;
                let km = parseInt(document.getElementById("km").value);
                let renter = document.getElementById("renter").value;
                let wilaya = document.getElementById("wilaya").value;
                let driver = document.getElementById("driver").value;
                let insuranceStart = document.getElementById("insuranceStart").value;
                let insuranceEnd = document.getElementById("insuranceEnd").value;

                console.log("Données du formulaire collectées:", {
                    plate, model, km, renter, wilaya, driver, insuranceStart, insuranceEnd
                });

                if (!plate || !model || isNaN(km) || !renter || !wilaya || !insuranceStart || !insuranceEnd) {
                    alert("Tous les champs requis doivent être remplis correctement");
                    return;
                }

                if (new Date(insuranceStart) > new Date(insuranceEnd)) {
                    alert("La date de début de l'assurance doit être avant la date de fin !");
                    return;
                }

                const existingCar = checkPlateForAutoFill(plate);
                if (!existingCar) {
                    if (!confirm(`Le numéro d'immatriculation ${plate} n'existe pas dans la base de données. Voulez-vous ajouter une nouvelle voiture avec ce numéro ?`)) {
                        return;
                    }
                }

                let cars = [];
                try {
                    cars = JSON.parse(localStorage.getItem("cars")) || [];
                    console.log("Voitures actuelles avant d'ajouter une nouvelle voiture:", cars);
                } catch (error) {
                    console.error("Erreur lors de l'analyse des voitures depuis localStorage:", error);
                    cars = [];
                    localStorage.setItem("cars", JSON.stringify(cars));
                }

                const newCar = { 
                    plate, 
                    model, 
                    totalKm: km,
                    kmRecords: [{ amount: km, date: insuranceStart }],
                    renter, 
                    wilaya, 
                    driver: driver || "", 
                    insuranceStart, 
                    insuranceEnd, 
                    fuelRecords: [], 
                    fuelCard: null, 
                    oilReset: false, 
                    gearReset: false 
                };

                console.log("Nouvelle voiture à ajouter:", newCar);

                cars.push(newCar);
                console.log("Voitures après ajout de la nouvelle voiture:", cars);

                localStorage.setItem("cars", JSON.stringify(cars));
                console.log("Voitures sauvegardées dans localStorage");

                carForm.reset();
                console.log("Formulaire réinitialisé");

                if (driver) driverInput.value = driver;
                loadAllCars();
                console.log("Tableau mis à jour après ajout de la nouvelle voiture");
            });

            window.updateKm = function (index) {
                let kmToAdd = parseInt(prompt("Entrez le kilométrage ajouté:"));
                if (isNaN(kmToAdd) || kmToAdd <= 0) {
                    alert("Entrez une valeur valide !");
                    return;
                }

                let kmDate = prompt("Entrez la date d'ajout (AAAA-MM-JJ):");
                if (!kmDate || !/^\d{4}-\d{2}-\d{2}$/.test(kmDate)) {
                    alert("Date invalide !");
                    return;
                }

                let cars = JSON.parse(localStorage.getItem("cars")) || [];
                let car = cars[index];
                car.kmRecords.push({ amount: kmToAdd, date: kmDate });
                car.totalKm = (car.totalKm || 0) + kmToAdd;
                localStorage.setItem("cars", JSON.stringify(cars));

                logOperation(car.plate, kmDate, "Augmentation du kilométrage", `${kmToAdd} km`);
                loadAllCars();
            }

            window.addFuel = function (index) {
                let cars = JSON.parse(localStorage.getItem("cars")) || [];
                let car = cars[index];

                let fuelCardPrompt = "Choisissez une carte de carburant:\n" + fuelCards.map((card, i) => `${i + 1}. ${card}`).join("\n");
                let fuelCardIndex = parseInt(prompt(fuelCardPrompt)) - 1;
                if (isNaN(fuelCardIndex) || fuelCardIndex < 0 || fuelCardIndex >= fuelCards.length) {
                    alert("Veuillez choisir une carte valide !");
                    return;
                }
                let fuelCard = fuelCards[fuelCardIndex];

                let fuelAmount = parseInt(prompt("Entrez le montant du carburant (DZD):"));
                if (isNaN(fuelAmount) || fuelAmount <= 0) {
                    alert("Entrez une valeur valide !");
                    return;
                }
                let currentFuelTotal = (car.fuelRecords || []).reduce((sum, r) => sum + (r.amount || 0), 0);
                if (currentFuelTotal + fuelAmount > 12000) {
                    alert("Le montant total ne peut pas dépasser 12000 DZD par carte ! Veuillez recharger la carte ou réduire le montant.");
                    return;
                }

                let fuelDate = prompt("Entrez la date d'ajout (AAAA-MM-JJ):");
                if (!fuelDate || !/^\d{4}-\d{2}-\d{2}$/.test(fuelDate)) {
                    alert("Date invalide !");
                    return;
                }

                car.fuelRecords.push({ amount: fuelAmount, date: fuelDate, card: fuelCard });
                car.fuelCard = fuelCard;
                localStorage.setItem("cars", JSON.stringify(cars));

                let totalFuel = car.fuelRecords.reduce((sum, r) => sum + (r.amount || 0), 0);
                if (totalFuel >= 12000) {
                    let isCharged = confirm("Le total du carburant a atteint 12000 DZD. La carte a-t-elle été rechargée ?");
                    if (isCharged) {
                        car.fuelRecords = [{ amount: fuelAmount, date: fuelDate, card: fuelCard }];
                        logOperation(car.plate, fuelDate, "Recharge de la carte", `Montant: ${fuelAmount} DZD`);
                    } else {
                        logOperation(car.plate, fuelDate, "Ajout de carburant", `Total: ${totalFuel} DZD, Carte: ${fuelCard}`);
                    }
                } else {
                    logOperation(car.plate, fuelDate, "Ajout de carburant", `${fuelAmount} DZD, Carte: ${fuelCard}`);
                }

                localStorage.setItem("cars", JSON.stringify(cars));
                loadAllCars();
            }

            window.editCar = function (index) {
                let cars = JSON.parse(localStorage.getItem("cars")) || [];
                let car = cars[index];

                let newPlate = prompt("Numéro d'immatriculation:", car.plate);
                let newModel = prompt("Nom de la voiture:", car.model);
                let newRenter = prompt("Locataire:", car.renter);
                let newWilaya = prompt("Wilaya:", car.wilaya);
                let newDriver = prompt("Conducteur (facultatif):", car.driver);
                let newInsuranceStart = prompt("Début de l'assurance (AAAA-MM-JJ):", car.insuranceStart);
                let newInsuranceEnd = prompt("Fin de l'assurance (AAAA-MM-JJ):", car.insuranceEnd);

                if (new Date(newInsuranceStart) > new Date(newInsuranceEnd)) {
                    alert("La date de début de l'assurance doit être avant la date de fin !");
                    return;
                }

                cars[index] = {
                    ...car,
                    plate: newPlate || car.plate,
                    model: newModel || car.model,
                    renter: newRenter || car.renter,
                    wilaya: newWilaya || car.wilaya,
                    driver: newDriver || "",
                    insuranceStart: newInsuranceStart || car.insuranceStart,
                    insuranceEnd: newInsuranceEnd || car.insuranceEnd
                };

                localStorage.setItem("cars", JSON.stringify(cars));
                loadAllCars();
            }

            window.deleteCar = function (index) {
                if (!confirm("Êtes-vous sûr de vouloir supprimer cette voiture ?")) return;

                let cars = JSON.parse(localStorage.getItem("cars")) || [];
                let car = cars[index];
                cars.splice(index, 1);
                localStorage.setItem("cars", JSON.stringify(cars));
                loadAllCars();
            }

            window.clearAllData = function () {
                if (!confirm("Êtes-vous sûr de vouloir supprimer toutes les données ?")) return;

                localStorage.clear();
                logs = [];
                loadAllCars();
                updateLogDisplay();
                alert("Toutes les données ont été supprimées !");
            }

            window.checkMaintenance = function (index) {
                let cars = JSON.parse(localStorage.getItem("cars")) || [];
                let car = cars[index];

                let oilDone = confirm("L'huile a-t-elle été changée ?");
                if (oilDone) {
                    car.oilReset = true;
                    car.totalKm = 0;
                    car.kmRecords = [{ amount: 0, date: new Date().toISOString().split('T')[0] }];
                }

                let gearDone = confirm("La maintenance de la boîte a-t-elle été effectuée ?");
                if (gearDone) {
                    car.gearReset = true;
                    car.totalKm = 0;
                    car.kmRecords = [{ amount: 0, date: new Date().toISOString().split('T')[0] }];
                }

                localStorage.setItem("cars", JSON.stringify(cars));
                loadAllCars();
            }

            window.exportToExcel = function () {
                let wb = XLSX.utils.book_new();
                let ws_data = [["Numéro d'immatriculation", "Nom de la voiture", "Locataire", "Conducteur", "Wilaya", "Kilométrage", "Carte de carburant", "Total carburant", "Alerte carburant", "Alerte maintenance huile", "Alerte maintenance boîte", "Période d'assurance", "Alerte assurance"]];
                let cars = JSON.parse(localStorage.getItem("cars")) || [];

                cars.forEach(car => {
                    let totalKm = (car.kmRecords || []).reduce((sum, km) => sum + (km.amount || 0), 0);
                    let totalFuel = (car.fuelRecords || []).reduce((sum, r) => sum + (r.amount || 0), 0);
                    ws_data.push([
                        car.plate, car.model, car.renter, car.driver || "-", car.wilaya,
                        totalKm + " km",
                        car.fuelCard || "Non défini",
                        totalFuel + " DZD",
                        checkFuel(car.fuelRecords),
                        checkOilMaintenance(totalKm, car.oilReset),
                        checkGearMaintenance(totalKm, car.gearReset),
                        `${car.insuranceStart} à ${car.insuranceEnd}`,
                        checkInsurance(car.insuranceEnd)
                    ]);
                });

                let ws = XLSX.utils.aoa_to_sheet(ws_data);
                XLSX.utils.book_append_sheet(wb, ws, "État des Voitures");
                XLSX.writeFile(wb, "etat_des_voitures.xlsx");
            }

            window.exportOperationsLog = function () {
                let wb = XLSX.utils.book_new();
                let ws_data = [["Numéro d'immatriculation", "Date", "Opération", "Détails"]];
                let logs = JSON.parse(localStorage.getItem("operationLogs")) || [];

                logs.forEach(log => {
                    ws_data.push([log.plate, log.date, log.operation, log.details]);
                });

                let ws = XLSX.utils.aoa_to_sheet(ws_data);
                XLSX.utils.book_append_sheet(wb, ws, "Journal des Opérations");
                XLSX.writeFile(wb, "journal_des_operations.xlsx");
            }

            console.log("Chargement initial des voitures");
            loadAllCars();
            updateLogDisplay();
        });
    </script>

</body>
</html>