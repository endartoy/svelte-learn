const disableBodyScroll = (val = true) => {
    val === true ? 
    (
        document.body.style.overflow = 'hidden'
    ) : (
        document.body.style.overflow = ''
    )
}

const formatRupiah = (input) => {
    // Remove any non-numeric characters except -
    let value = input.value.replace(/(?!^-)[^,\d]/g, ''); 

    if (value === '') {
        input.value = ''; // If the input is empty, return
        return;
    }

    // Convert the value to an integer for formatting
    let numericValue = parseInt(value.replace(/,/g, ''));
    if (isNaN(numericValue)) return;

    // Format the value as Rupiah
    let formattedValue = new Intl.NumberFormat('id-ID').format(numericValue);

    input.value = formattedValue;
}

const viewRupiah = (ini) => {
    let formattedValue = new Intl.NumberFormat('id-ID').format(ini);
    return formattedValue;
}

const formatInterger = (val) => {
    const isNegative = val.startsWith('-');
    const cleanedString = val.replace(/[^0-9]/g, '');

    let integerValue = parseInt(cleanedString, 10);

    return isNegative ? integerValue * -1 : integerValue
}

const dateOption = {
    duadigit: { day: '2-digit', month: '2-digit', year: '2-digit' },
    dateForInput: { year: 'numeric', month: '2-digit', day: '2-digit' },
    dateForPdf: { day: 'numeric', month: 'long', year: 'numeric' },
    dateForParaf: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
    dateForKasList: { day: 'numeric', month: 'long', year: 'numeric' }
}

export { disableBodyScroll, formatRupiah, viewRupiah, formatInterger, dateOption }