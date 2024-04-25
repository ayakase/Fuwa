<template>
    <div class="loading-container">
        <div class="lds-dual-ring"></div>
    </div>
</template>

<script>
</script>

<style scoped>
.loading-container {
    width: 100%;
    /* height: 100%; */
    display: flex;
    flex-direction: row;
    justify-content: center;
}

.lds-dual-ring {
    display: inline-flex;
    flex-direction: column;
    justify-content: center;

    height: 100%;
}

.lds-dual-ring:after {
    content: " ";
    display: block;
    width: 30px;
    height: 30px;
    margin: 1px;
    border-radius: 50%;
    border: 6px solid #878787;
    border-color: #878787 transparent #878787 transparent;
    animation: lds-dual-ring 1.2s linear infinite;
}

@keyframes lds-dual-ring {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>