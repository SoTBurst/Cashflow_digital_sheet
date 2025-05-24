// Bank Loan functionality

function setupBankLoanButtons() {
  // Tracking-Variable für die aktuelle Sequenz von Bankkrediten
  let currentBankEntryAmount = 0;
  let currentBankEntryElement = null;
  // Knopf zum Abbezahlen von 1000 Euro
  document.getElementById('btn-pay-bank-1000').addEventListener('click', () => {
    const loanInput = document.getElementById('input-liability-bank');
    const loanAmount = parseFloat(loanInput.value) || 0;

    if (loanAmount >= 1000 && window.CashflowCore.runningBalance() >= 1000) {
      // Kredit um 1000 reduzieren
      const newLoanAmount = loanAmount - 1000;      loanInput.value = window.formatCurrency(newLoanAmount);

      // Kontostand anpassen
      window.CashflowCore.setRunningBalance(window.CashflowCore.runningBalance() - 1000);

      // Zinszahlung anpassen (10% des neuen Betrags)
      const newPayment = Math.round(newLoanAmount * 0.1);
      document.getElementById('input-expenses-bank').value = window.formatCurrency(newPayment);

      // Kontostandanzeige im Bargeldkonto aktualisieren
      updateBankEntryInList(-1000);

      // Nach Bankkredit-Aktion Flag zurücksetzen
      window.lastActionWasManualEntry = false;      // Oberfläche aktualisieren
      window.CashflowCore.updateDisplayBalance();
      window.CashflowCore.updateSummary();
      window.CashflowCore.updatePayButtonStates();
    }
  });

  // Knopf zum Aufnehmen von 1000 Euro
  document.getElementById('btn-take-bank-1000').addEventListener('click', () => {
    const loanInput = document.getElementById('input-liability-bank');
    const loanAmount = parseFloat(loanInput.value) || 0;    // Kredit um 1000 erhöhen
    const newLoanAmount = loanAmount + 1000;    loanInput.value = window.formatCurrency(newLoanAmount);

    // Kontostand anpassen
    window.CashflowCore.setRunningBalance(window.CashflowCore.runningBalance() + 1000);

    // Zinszahlung anpassen (10% des neuen Betrags)
    const newPayment = Math.round(newLoanAmount * 0.1);
    document.getElementById('input-expenses-bank').value = window.formatCurrency(newPayment);

    // Kontostandanzeige im Bargeldkonto aktualisieren
    updateBankEntryInList(1000);

    // Nach Bankkredit-Aktion Flag zurücksetzen
    window.lastActionWasManualEntry = false;

    // Oberfläche aktualisieren
    window.CashflowCore.updateDisplayBalance();
    window.CashflowCore.updateSummary();
  });
    // Funktion zum Aktualisieren des Bankkredit-Eintrags in der Liste
  function updateBankEntryInList(amount) {
    const ul = document.getElementById('entries');
    const entriesChildren = Array.from(ul.children);

    // Zuerst check, ob wir ein leeres Eingabefeld am Anfang haben
    const isFirstEntryEmpty = entriesChildren.length > 0 &&
      entriesChildren[0].querySelector('input').type === 'number';

    // Wenn die letzte Aktion eine manuelle Eingabe war, erstellen wir immer einen neuen Eintrag
    if (window.lastActionWasManualEntry) {
      // Neuen Eintrag für die Bankkredit-Änderung erstellen
      currentBankEntryAmount = amount;
      createNewBankEntry(amount, isFirstEntryEmpty ? entriesChildren[0] : null);
      return;
    }

    // Prüfen, ob ein bestehender Bankkredit-Eintrag existiert (überprüfen der ersten Einträge)
    // Wir suchen vom Anfang, beginnend mit dem ersten oder zweiten Element (je nach leerem Feld am Anfang)
    let bankCreditEntryIndex = -1;

    // Wir starten die Suche beim ersten oder zweiten Element (je nach leerem Feld am Anfang)
    const startIndex = isFirstEntryEmpty ? 1 : 0;

    // Suche nach dem ersten Bankkredit-Eintrag
    for (let i = startIndex; i < entriesChildren.length; i++) {
      const input = entriesChildren[i].querySelector('input');
      if (input && input.dataset.bankCredit === 'true') {
        bankCreditEntryIndex = i;
        break;
      }
    }

    // Fall 1: Es gibt einen existierenden Bankkredit-Eintrag
    if (bankCreditEntryIndex >= 0) {
      const bankCreditEntry = entriesChildren[bankCreditEntryIndex].querySelector('input');      // Aktualisiere den Wert des bestehenden Eintrags
      currentBankEntryAmount = window.parseFormattedNumber(bankCreditEntry.value);
      currentBankEntryAmount += amount;

      bankCreditEntry.value = window.formatNumberWithSign(currentBankEntryAmount);

      if (currentBankEntryAmount < 0) {
        bankCreditEntry.style.color = 'var(--danger)';
      } else {
        bankCreditEntry.style.color = '';
      }

      // Finde den zugehörigen Kontostand-Eintrag (sollte direkt danach kommen)
      if (bankCreditEntryIndex + 1 < entriesChildren.length) {
        const balanceEntry = entriesChildren[bankCreditEntryIndex + 1].querySelector('input');
        if (balanceEntry && balanceEntry.style.background === 'rgb(238, 238, 238)') {
          balanceEntry.value = window.formatNumberWithSign(window.CashflowCore.runningBalance());

          if (window.CashflowCore.runningBalance() < 0) {
            balanceEntry.style.color = 'var(--danger)';
          } else {
            balanceEntry.style.color = '';
          }
        }
      }

      return;
    }

    // Fall 2: Es gibt keinen existierenden Bankkredit-Eintrag, also erstellen wir einen neuen
    currentBankEntryAmount = amount;
    createNewBankEntry(amount, isFirstEntryEmpty ? entriesChildren[0] : null);
  }
  // Hilfsfunktion zum Erstellen eines neuen Bankkredit-Eintrags
  function createNewBankEntry(amount, insertAfterElement) {
    const ul = document.getElementById('entries');

    // Neuen Eintrag für die Bankkredit-Änderung erstellen
    const li = document.createElement('li');
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.readOnly = true;
    inp.value = window.formatNumberWithSign(amount);
    inp.dataset.bankCredit = 'true'; // Markiere als Bankkredit-Eintrag

    if (amount < 0) {
      inp.style.color = 'var(--danger)';
    }

    li.append(inp);

    if (insertAfterElement) {
      // Einfügen nach dem leeren Eingabefeld
      insertAfterElement.after(li);
    } else {
      // Am Anfang einfügen, wenn kein leeres Eingabefeld vorhanden ist
      ul.prepend(li);
    }

    // Aktualisiere den Kontostand-Eintrag
    const sumLi = document.createElement('li');
    const sumInp = document.createElement('input');
    sumInp.type = 'text';
    sumInp.readOnly = true;
    sumInp.value = window.formatNumberWithSign(window.CashflowCore.runningBalance());
    sumInp.style.background = '#eee';

    if (window.CashflowCore.runningBalance() < 0) {
      sumInp.style.color = 'var(--danger)';
    }

    sumLi.append(sumInp);

    // Kontostand-Eintrag nach dem Bankkredit-Eintrag einfügen
    li.after(sumLi);

    // Aktuelle Elemente für spätere Aktualisierungen speichern
    currentBankEntryElement = inp;
  }
}
