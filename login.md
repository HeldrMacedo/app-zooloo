<?php

use Adianti\Core\AdiantiApplicationConfig;
use Adianti\Service\AdiantiRestService;
use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

class ApplicationAuthenticationRestService implements AdiantiRestService
{
    /**
     * Método de login para aplicativos móveis
     */
    public static function login($param)
    {
        try
        {   
            echo json_encode($param);
            // Validar parâmetros obrigatórios
            if (empty($param['data']['login']) || empty($param['data']['password']))
            {
                return array(
                    'success' => false,
                    'message' => 'Login e senha são obrigatórios'
                );
            }
            
            // Autenticar usuário
            $user = ApplicationAuthenticationService::authenticate($param['data']['login'], $param['data']['password'], false);
            
            if (!$user)
            {
                return array(
                    'success' => false,
                    'message' => 'Credenciais inválidas'
                );
            }
            
            // Verificar se usuário está ativo
            if ($user->active !== 'Y')
            {
                return array(
                    'success' => false,
                    'message' => 'Usuário inativo'
                );
            }
            
            $ini = AdiantiApplicationConfig::get();
            $key = APPLICATION_NAME . $ini['general']['seed'];
            
            if (empty($ini['general']['seed']))
            {
                return array(
                    'success' => false,
                    'message' => 'Application seed not defined'
                );
            }
            
            // Criar payload do token
            $token_payload = array(
                "user" => $param['data']['login'],
                "userid" => $user->id,
                "username" => $user->name,
                "usermail" => $user->email,
                "issued_at" => time(),
                "expires" => strtotime("+ 1 hour") // Token válido por 1 hora
            );
            
            // Gerar token JWT
            $token = JWT::encode($token_payload, $key, 'HS256');
            
            // Registrar login se o serviço existir
            if (class_exists('SystemAccessLogService'))
            {
                SystemAccessLogService::registerLogin();
            }
            
            // Retornar dados do usuário e token
            return array(
                'success' => true,
                'message' => 'Login realizado com sucesso',
                'user' => array(
                    'id' => $user->id,
                    'login' => $user->login,
                    'name' => $user->name,
                    'email' => $user->email,
                    'active' => $user->active
                ),
                'token' => $token,
                'expires_at' => date('Y-m-d H:i:s', $token_payload['expires'])
            );
        }
        catch (Exception $e)
        {
            return array(
                'success' => false,
                'message' => $e->getMessage()
            );
        }
    }
    
    /**
     * Método para validar token
     */
    public static function validateToken($param)
    {
        try
        {
            if (empty($param['token']))
            {
                return array(
                    'success' => false,
                    'message' => 'Token é obrigatório'
                );
            }
            
            $ini = AdiantiApplicationConfig::get();
            $key = APPLICATION_NAME . $ini['general']['seed'];
            
            if (empty($ini['general']['seed']))
            {
                return array(
                    'success' => false,
                    'message' => 'Application seed not defined'
                );
            }
            
            // Decodificar token
            $decoded = (array) JWT::decode($param['token'], new Key($key, 'HS256'));
            
            // Verificar se token não expirou
            if ($decoded['expires'] < time())
            {
                return array(
                    'success' => false,
                    'message' => 'Token expirado'
                );
            }
            
            return array(
                'success' => true,
                'message' => 'Token válido',
                'user' => array(
                    'id' => $decoded['userid'],
                    'login' => $decoded['user'],
                    'name' => $decoded['username'],
                    'email' => $decoded['usermail']
                ),
                'expires_at' => date('Y-m-d H:i:s', $decoded['expires'])
            );
        }
        catch (Exception $e)
        {
            return array(
                'success' => false,
                'message' => 'Token inválido: ' . $e->getMessage()
            );
        }
    }
    
    /**
     * Método para refresh do token
     */
    public static function refreshToken($param)
    {
        try
        {
            if (empty($param['token']))
            {
                return array(
                    'success' => false,
                    'message' => 'Token é obrigatório'
                );
            }
            
            $ini = AdiantiApplicationConfig::get();
            $key = APPLICATION_NAME . $ini['general']['seed'];
            
            if (empty($ini['general']['seed']))
            {
                return array(
                    'success' => false,
                    'message' => 'Application seed not defined'
                );
            }
            
            // Decodificar token atual
            $decoded = (array) JWT::decode($param['token'], new Key($key, 'HS256'));
            
            // Criar novo token com nova expiração
            $new_token_payload = array(
                "user" => $decoded['user'],
                "userid" => $decoded['userid'],
                "username" => $decoded['username'],
                "usermail" => $decoded['usermail'],
                "issued_at" => time(),
                "expires" => strtotime("+ 1 hour")
            );
            
            $new_token = JWT::encode($new_token_payload, $key, 'HS256');
            
            return array(
                'success' => true,
                'message' => 'Token renovado com sucesso',
                'token' => $new_token,
                'expires_at' => date('Y-m-d H:i:s', $new_token_payload['expires'])
            );
        }
        catch (Exception $e)
        {
            return array(
                'success' => false,
                'message' => 'Erro ao renovar token: ' . $e->getMessage()
            );
        }
    }
    
    /**
     * Método para logout
     */
    public static function logout($param)
    {
        try
        {
            // Registrar logout se token for válido
            if (!empty($param['token']))
            {
                try
                {
                    $ini = AdiantiApplicationConfig::get();
                    $key = APPLICATION_NAME . $ini['general']['seed'];
                    $decoded = (array) JWT::decode($param['token'], new Key($key, 'HS256'));
                    
                    // Simular sessão para registrar logout
                    if (class_exists('TSession'))
                    {
                        TSession::setValue('login', $decoded['user']);
                    }
                    
                    if (class_exists('SystemAccessLogService'))
                    {
                        SystemAccessLogService::registerLogout();
                    }
                }
                catch (Exception $e)
                {
                    // Token inválido, mas ainda assim processar logout
                }
            }
            
            return array(
                'success' => true,
                'message' => 'Logout realizado com sucesso'
            );
        }
        catch (Exception $e)
        {
            return array(
                'success' => false,
                'message' => $e->getMessage()
            );
        }
    }
    
    /**
     * Método legado para compatibilidade (usado pelos exemplos em /rest)
     */
    public static function getToken($param)
    {
        $result = self::login($param);
        
        if ($result['success'])
        {
            return $result['token'];
        }
        else
        {
            throw new Exception($result['message']);
        }
    }
}

<?php

use Adianti\Core\AdiantiApplicationConfig;
use Adianti\Core\AdiantiCoreApplication;

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// initialization script
require_once 'init.php';

class AdiantiRestServer
{
    public static function run($request)
    {
        $ini      = AdiantiApplicationConfig::get();
        $input    = json_decode(file_get_contents("php://input"), true);
        $request  = array_merge($request, (array) $input);
        $class    = isset($request['class']) ? $request['class']   : '';
        $method   = isset($request['method']) ? $request['method'] : '';
        $headers  = AdiantiCoreApplication::getHeaders();
        $response = NULL;
        
        $headers['Authorization'] = $headers['Authorization'] ?? ($headers['authorization'] ?? null);
        
        try
        {
            // Para métodos de login, não exigir autorização
            if ($class === 'ApplicationAuthenticationRestService' && $method === 'login')
            {
                // Login não precisa de autorização prévia
            }
            else if (empty($headers['Authorization']))
            {
                throw new Exception('Authorization required');
            }
            else
            {
                if (substr($headers['Authorization'], 0, 5) == 'Basic')
                {
                    if (empty($ini['general']['rest_key']))
                    {
                        throw new Exception('REST key not defined');
                    }
                    
                    if ($ini['general']['rest_key'] !== substr($headers['Authorization'], 6))
                    {
                        http_response_code(401);
                        return json_encode(array('status' => 'error', 'data' => 'Authorization error'));
                    }
                }
                else if (substr($headers['Authorization'], 0, 6) == 'Bearer')
                {
                    // Validar token JWT usando o serviço de autenticação
                    $token = substr($headers['Authorization'], 7);
                    $validation = ApplicationAuthenticationRestService::validateToken(['token' => $token]);
                    
                    if (!$validation['success'])
                    {
                        http_response_code(401);
                        return json_encode(array('status' => 'error', 'data' => $validation['message']));
                    }
                }
                else
                {
                    http_response_code(403);
                    throw new Exception('Authorization error');
                }
            }
            
            // Executar método da classe
            if (class_exists($class) && method_exists($class, $method))
            {
                $response = call_user_func(array($class, $method), $request);
            }
            else
            {
                throw new Exception("Class {$class} or method {$method} not found");
            }
            
            if (is_array($response))
            {
                array_walk_recursive($response, ['AdiantiStringConversion', 'assureUnicode']);
            }
            return json_encode(array('status' => 'success', 'data' => $response));
        }
        catch (Exception $e)
        {
            if (200 === http_response_code())
            {
                http_response_code(500);
            }
            return json_encode(array('status' => 'error', 'data' => $e->getMessage()));
        }
        catch (Error $e)
        {
            if (200 === http_response_code())
            {
                http_response_code(500);
            }
            return json_encode(array('status' => 'error', 'data' => $e->getMessage()));
        }
    }
}
print AdiantiRestServer::run($_REQUEST);

endpoint: http://localhost/rest.php
payload:
{
    "class": "ApplicationAuthenticationRestService",
    "method": "login",
    "data": {
        "login": "admin",
        "password": "admin"
    }
}

response da api:{"status":"success","data":{"success":true,"message":"Login realizado com sucesso","user":{"id":1,"login":"admin","name":"Administrator","email":"admin@admin.net","active":"Y"},"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJ1c2VyaWQiOjEsInVzZXJuYW1lIjoiQWRtaW5pc3RyYXRvciIsInVzZXJtYWlsIjoiYWRtaW5AYWRtaW4ubmV0IiwiaXNzdWVkX2F0IjoxNzU5NDI0MTc1LCJleHBpcmVzIjoxNzU5NDI3Nzc1fQ.X-gt_xeztOICT1-XiL_UGYIiO2D5cmYd5FLBnRNHkig","expires_at":"2025-10-02 14:56:15"}} 