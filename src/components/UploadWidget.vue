<template>
    <div class="uw">
        <h3>Upload Widget Example</h3>
        <button v-on:click="open" id="upload_widget" class="cloudinary-button">
            Upload files
        </button>
    </div>
</template>
  
<script>
const cloudName = "dxkmteupm"; 
const uploadPreset = "facs1lgn"; 
const myWidget = cloudinary.createUploadWidget(
    {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
    },
    (error, result) => {
        if (!error && result && result.event === "success") {
            console.log("Done! Here is the image info: ", result.info);
            document
                .getElementById("uploadedimage")
                .setAttribute("src", result.info.secure_url);
        }
    }
);

export default {
    name: "UploadWidget",
    data: () => ({
        open: function () {
            myWidget.open();
        },
    }),
    props: {
        msg: String,
    },
};
</script>
  
  
