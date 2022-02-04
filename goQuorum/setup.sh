!/bin/bash

#Define jwtkeys
mkdir auth_mgmt_api/src/config/jwt/
mkdir weighingtickets_api/src/config/jwt/

ssh-keygen -t rsa -P "" -b 4096 -m PEM -f auth_mgmt_api/src/config/jwt/jwtRS256.key
ssh-keygen -e -m PEM -f auth_mgmt_api/src/config/jwt/jwtRS256.key > auth_mgmt_api/src/config/jwt/jwtRS256.key.pub

ssh-keygen -t rsa -P "" -b 4096 -m PEM -f auth_mgmt_api/src/config/jwt/jwtRS256Refresh.key
ssh-keygen -e -m PEM -f auth_mgmt_api/src/config/jwt/jwtRS256.key > auth_mgmt_api/src/config/jwt/jwtRS256Refresh.key.pub

mv auth_mgmt_api/src/config/jwt/jwtRS256.key auth_mgmt_api/src/config/jwt/jwt.key
mv auth_mgmt_api/src/config/jwt/jwtRS256.key.pub auth_mgmt_api/src/config/jwt/jwt.pub.key

mv auth_mgmt_api/src/config/jwt/jwtRS256Refresh.key auth_mgmt_api/src/config/jwt/jwtRefresh.key
mv auth_mgmt_api/src/config/jwt/jwtRS256Refresh.key.pub auth_mgmt_api/src/config/jwt/jwtRefresh.pub.key

cp auth_mgmt_api/src/config/jwt/jwt.pub.key weighingtickets_api/src/config/jwt/jwt.pub.key

#Download and set the quorum network
cd network 
git clone https://github.com/Consensys/quorum-examples.git
mv quorum-examples/examples/ .
rm -rf quorum-examples/

cd examples
rm -rf adding_nodes/
rm -rf ibft_validator_set_changes/
cd ../../

mkdir auth_mgmt_api/src/config/smartContract/

cd smart_contract
echo "Compiling the smart contract ..."
node compile.js
echo "Smart contract compiled"
cp build/WeighingTickets.json ../auth_mgmt_api/src/config/smartContract/WeighingTickets.json
cp build/abi/WeighingTickets.json ../weighingtickets_api/src/connection
echo "Files copied to the appropriate location in the APIs."
cd ..

#import npm install fs-extra
#import sudo apt-get install libjffi-jni