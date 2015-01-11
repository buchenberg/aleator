package dev.gbuchenberger.aleator.controller;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import dev.gbuchenberger.aleator.domain.nlp.Token;
import dev.gbuchenberger.aleator.domain.repository.TokenRepository;

@RestController
@RequestMapping("api/token")
public class TokenController {
	protected final Logger log = LoggerFactory.getLogger(getClass());

	@Autowired
	private TokenRepository tokenRepo;
	@RequestMapping(
			value = "", 
			method = RequestMethod.GET, 
			produces = "application/json")
	public Iterable<Token> getToken() {
		log.info("Get token");
		return tokenRepo.findAll();
	}
	@RequestMapping(
			value = "/{id}", 
			method = RequestMethod.GET, 
			produces = "application/json")
	public Token getToken(@PathVariable("id") Long id) {
		log.info("Get token");
		return tokenRepo.findByHjid(id);
	}
	@RequestMapping(
		    value = "/word/random/{pos}",
		    method = RequestMethod.GET,
		    produces = "application/json")
	public String getRandomWordByPos(@PathVariable("pos") String pos) {
		log.info("Get random word by pos");
		return tokenRepo.findRandomWordByPos(pos);
	}
	@RequestMapping(
		    value = "/pos",
		    method = RequestMethod.GET,
		    produces = "application/json")
	public Iterable<String> getTokenPos() {
		log.info("Get tokens by pos");
		List<String> list = new ArrayList<String>();
		for (Token t : tokenRepo.findAll()){
			list.add(t.getPos());
		}
		return list;
	}
	@RequestMapping(
		    value = "/word",
		    method = RequestMethod.GET,
		    produces = "application/json")
	public Iterable<String> getTokenWord() {
		log.info("Get token words");
		List<String> list = new ArrayList<String>();
		for (Token t : tokenRepo.findAll()){
			list.add(t.getWord());
		}
		return list;
	}
	@RequestMapping(
		    value = "/pos/{pos}",
		    method = RequestMethod.GET,
		    produces = "application/json")
	public Iterable<Token> getTokenByPos(@PathVariable("pos") String pos) {
		log.info("Get tokens by pos");
		return tokenRepo.findByPos(pos);
	}
	@RequestMapping(
		    value = "/{id}/pos",
		    method = RequestMethod.GET,
		    produces = "application/json")
	public Iterable<String> findPosByTokensId(@PathVariable("id") long id) {
		log.info("Get POS by tokens id");
		return tokenRepo.findPosByTokensId(id);
	}
	@RequestMapping(
		    value = "/random/pos",
		    method = RequestMethod.GET,
		    produces = "application/json")
	public Iterable<String> getPosByRandom() {
		Long randomTokensId = tokenRepo.getRandomTokensId();
		return tokenRepo.findPosByTokensId(randomTokensId);
	}

}
