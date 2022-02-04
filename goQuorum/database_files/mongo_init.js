db.createUser(
    {
        user: "reader",
        pwd: "reader_pass",
        roles: [
            {
                role: 'read',
                db: 'sw_auth'
            }
        ]
    }
);

db.users.insertOne({
    "_id" : ObjectId("5f77341a31583672c4415726"),
	"role" : "customer",
	"first_pass" : false,
	"password_changed" : false,
	"active" : true,
	"deleted" : false,
	"email" : "admin@customerx.com",
	"password" : "$2b$10$L1PlP5KXVV3Qv8Axi1rPLOD62ZQOI7ljVxUg24jP8hyW2HPwO1qfu",
	"customer" : "5f77341a31583672c4415725",
	"created_at" : ISODate("2020-10-02T14:07:22.495Z"),
	"updated_at" : ISODate("2020-10-02T14:08:50.036Z"),
	"__v" : 0
})

db.users.insertOne({
    "_id" : ObjectId("5f77364fa9614f90daa6594a"),
	"email" : "admin_start@bilanciai.it",
	"password" : "$2b$10$JcOcnOCSq8IvaKAXIf3ncO/f/7I8VkE4fBBg172AMdYO2lrWXG0I6",
	"customer" : "",
	"role" : "admin",
	"address" : '05b0f79cd7b6323ffe602578db6ca232:d2cdb379f9e8e7236d8f34a7b491ec7c:7b87698458b03787fd39a0a21d0e3a31a6d4355304e3e8cc604df95987d7450d6f07deb5ee52180d4f15',
	"node" : '3656c099cab7c03a97e9f5104f6ed46d:8892c9285a3f542120add894b24c4f9c:cfb2a2b572b3af79cf5a6fb2a3d0a9b9e0',
	"tesseraPublicKey" : '93de164b5db738ea00187bd69faee65e:807b55e826bfaa1326cee7171d94cc0b:d60b7cd359bf7ed672cab4c2fd784fdbce0240a3247ad15d62df6c7ac5ab337976d2333ccdbf6e8ac4a8ebb4',
	"first_pass" : false,
	"password_changed" : false,
	"active" : true,
	"deleted" : false,
	"created_at" : 1601648207577,
	"updated_at" : 160164820757
})

db.customers.insertOne({
    "_id" : ObjectId("5f77341a31583672c4415725"),
	"active" : true,
	"deleted" : false,
	"name" : "CustomerX",
	"location" : "Portugal",
	"description" : "",
	"companyID" : "CC-C1",
	"customerAdminAddress" : '3f78b59aa002b6adad244be0fe92f0c3:5fa1cee52538ce1e55c1e99ba7a1d808:ad0c97b2eaa2498384a97171e6bd5b449e009c6590996ae38ed48bd65ef5261fddaba9892f89c2d7e987',
	"customerAdminNode" : '752c6bfebb3036a2e07fb642583298da:aaf0f52478fb9da24007a7178a01e39f:776354fa821f36ae7f0d5f6c9dd2548cd8',
	"customerAdminTesseraPublicKey" : 'e38fa73ea7f1310e1a6453632df9824e:2e05bd83ff42e046296a0dd469f042b7:77bcfd5238d94a2ee7ae21a86b009243b2a9d18c345340172c22bdcd5b76db54e18355d0e8f58ef58b40fe10',
	"created_at" : ISODate("2020-10-02T14:07:22.441Z"),
	"updated_at" : ISODate("2020-10-02T14:07:22.441Z"),
	"__v" : 0
})