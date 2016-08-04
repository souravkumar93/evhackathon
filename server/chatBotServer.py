from chatterbot import ChatBot
from chatterbot.training.trainers import ChatterBotCorpusTrainer
from http.server import BaseHTTPRequestHandler,HTTPServer,SimpleHTTPRequestHandler,test
import cgi
import json



class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

if __name__ == '__main__':
    test(HandlerClass=CORSRequestHandler)

PORT_NUMBER = 8080

chatbot = ChatBot("Ron Obvious")
chatbot.set_trainer(ChatterBotCorpusTrainer)

# Train based on the english corpus
chatbot.train("chatterbot.corpus.english")

# Train based on english greetings corpus
chatbot.train("chatterbot.corpus.english.greetings")

# Train based on the english conversations corpus
chatbot.train("chatterbot.corpus.english.conversations")


#This class will handles any incoming request from
#the browser 
class myHandler(BaseHTTPRequestHandler):
	
	#Handler for the GET requests
	def do_GET(self):
		self.send_response(200)
		self.send_header('Content-type','text/html')
		self.end_headers()
		# Send the html message
		self.wfile.write(bytes("Hello World !", "utf-8"))
		return

	def do_POST(self):
            content_len = int(self.headers.get('content-length', 0))
            print(content_len)
            post_body = self.rfile.read(content_len)
            self.send_response(200)
            self.send_header('Content-type','text/html')
            self.end_headers()
            req = json.loads(post_body.decode('utf-8'))["name"]
            print("que :", req);
            res = str(chatbot.get_response(req)) + ""
            print("Ans : ",res);
            self.wfile.write(res.encode("utf-8"));
            return

try:
	#Create a web server and define the handler to manage the
	#incoming request
	server = HTTPServer(('', PORT_NUMBER), myHandler)
	print('Started httpserver on port ' , PORT_NUMBER)
	
	#Wait forever for incoming htto requests
	server.serve_forever()

except KeyboardInterrupt:
	print ('^C received, shutting down the web server')
	server.socket.close()



