package dev.gbuchenberger.aleator.controllers;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dev.gbuchenberger.aleator.domain.nlp.Token;
import dev.gbuchenberger.aleator.domain.repository.TokenRepository;

@RestController
public class TokenController {
	protected final Logger log = LoggerFactory.getLogger(getClass());

	@Autowired
	private TokenRepository tokenRepo;
	
	@RequestMapping("token")
	public Iterable<Token> getToken() {
		log.info("Get token");
		return tokenRepo.findAll();
	}

	@RequestMapping("token/{id}")
	public Token getToken(@PathVariable("id") long id) {
		log.info("Get token");
		return tokenRepo.findOne(id);
	}


	@RequestMapping("token/word/random/{pos}")
	public String getRandomWordByPos(@PathVariable("pos") String pos) {
		log.info("Get random word by pos");
		return tokenRepo.findRandomWordByPos(pos);
	}
	
	@RequestMapping("token/pos")
	public Iterable<String> getTokenPos() {
		log.info("Get tokens by pos");
		List<String> list = new ArrayList<String>();
		for (Token t : tokenRepo.findAll()){
			list.add(t.getPos());
		}
		return list;
	}
	
	@RequestMapping("token/word")
	public Iterable<String> getTokenWord() {
		log.info("Get tokens by pos");
		List<String> list = new ArrayList<String>();
		for (Token t : tokenRepo.findAll()){
			list.add(t.getWord());
		}
		return list;
	}
	
	@RequestMapping("token/pos/{pos}")
	public Iterable<Token> getTokenByPos(@PathVariable("pos") String pos) {
		log.info("Get tokens by pos");
		return tokenRepo.findByPos(pos);
	}

	@RequestMapping("token/{id}/pos")
	public Iterable<String> findPosByTokensId(@PathVariable("id") long id) {
		log.info("Get POS by tokens id");
		return tokenRepo.findPosByTokensId(id);
	}

	@RequestMapping("token/random/pos")
	public Iterable<String> getPosByRandom() {
		Long randomTokensId = tokenRepo.getRandomTokensId();
		return tokenRepo.findPosByTokensId(randomTokensId);
	}

}
